package permits

import database.DatabaseConfig
import database.documents.FishingPermitDocument
import database.documents.UserDocument
import exceptions.UserException
import kotlinx.coroutines.runBlocking
import managers.PermitManager
import org.bson.types.ObjectId
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.litote.kmongo.eq
import server.models.input.FishingPermitRequestJson
import server.permitNowConfiguration

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PermitManagerTests {

    private lateinit var testDB: DatabaseConfig
    private lateinit var permitManager: PermitManager

    // Verified seed user with a VALID embedded license (noKill = false) and two pre-seeded permits.
    private var permitUserId: String = ""
    // Verified seed user WITHOUT a fishing license (email "test@test.com"), and with no permits.
    private var noLicenseUserId: String = ""
    // Unverified seed user (name "Test2").
    private var unverifiedUserId: String = ""
    // Soft-deleted seed user (deleted = true).
    private var deletedUserId: String = ""
    // Verified seed user with a non-VALID (PENDING) embedded license.
    private var invalidLicenseUserId: String = ""
    // Verified seed user with a VALID but no-kill embedded license.
    private var noKillLicenseUserId: String = ""

    @BeforeEach
    fun init() {
        runBlocking {
            testDB = MockDatabase.createDatabase()
            permitManager = PermitManager(testDB, permitNowConfiguration)

            val permitUser = testDB.userCollection.findOne(UserDocument::email eq "permit@test.com")
            permitUserId = permitUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user permit@test.com is missing")

            val noLicenseUser = testDB.userCollection.findOne(UserDocument::email eq "test@test.com")
            noLicenseUserId = noLicenseUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user test@test.com is missing")

            val unverified = testDB.userCollection.findOne(UserDocument::name eq "Test2")
            unverifiedUserId = unverified?._id?.toHexString()
                ?: throw IllegalStateException("Unverified seed user 'Test2' is missing")

            val deleted = testDB.userCollection.findOne(UserDocument::deleted eq true)
            deletedUserId = deleted?._id?.toHexString()
                ?: throw IllegalStateException("Seed user with deleted = true is missing")

            val invalidLicense = testDB.userCollection.findOne(UserDocument::email eq "invalid-license@test.com")
            invalidLicenseUserId = invalidLicense?._id?.toHexString()
                ?: throw IllegalStateException("Seed user invalid-license@test.com is missing")

            val noKillLicense = testDB.userCollection.findOne(UserDocument::email eq "nokill-license@test.com")
            noKillLicenseUserId = noKillLicense?._id?.toHexString()
                ?: throw IllegalStateException("Seed user nokill-license@test.com is missing")
        }
    }

    @AfterEach
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }

    // Builds a request that is valid for permitUser; individual tests override only what they exercise.
    private fun validRequest(
        userId: String = permitUserId,
        zone: String = "ALTO_SARCA",
        type: String = "GIORNALIERO",
        noKill: Boolean = false,
        startDate: String = "2026-06-10",
        numberOfRods: Int = 1,
        maxCatch: Int = 3
    ) = FishingPermitRequestJson(userId, zone, type, noKill, startDate, numberOfRods, maxCatch)

    // ---------------------------------------------------------------------------------------------
    // requestPermit (user creation)
    // ---------------------------------------------------------------------------------------------

    @Test
    fun `requestPermit with valid data persists an active paid permit`() = runBlocking {
        // Unique startDate so the newly created permit can be told apart from the seeded ones.
        permitManager.requestPermit(validRequest(type = "GIORNALIERO", startDate = "2026-06-10", maxCatch = 3))

        val saved = testDB.fishingPermitCollection.findOne(FishingPermitDocument::startDate eq "2026-06-10")
        assertNotNull(saved)
        assertEquals(permitUserId, saved!!.userId)
        assertEquals("ACTIVE", saved.status)
        // user flow is paid: price comes from priceForType (GIORNALIERO = 23.0)
        assertEquals(23.0, saved.price)
        assertEquals("2026-06-11", saved.endDate) // GIORNALIERO = start + 1 day
        assertEquals(3, saved.maxCatch)
        assertTrue(saved.qrCodeToken.isNotBlank())
    }

    @Test
    fun `requestPermit with noKill forces maxCatch to zero`() = runBlocking {
        permitManager.requestPermit(validRequest(noKill = true, startDate = "2026-06-12", maxCatch = 9))

        val saved = testDB.fishingPermitCollection.findOne(FishingPermitDocument::startDate eq "2026-06-12")
        assertNotNull(saved)
        assertTrue(saved!!.noKill)
        assertEquals(0, saved.maxCatch)
    }

    @Test
    fun `requestPermit for ANNUALE computes one year end date and annual price`() = runBlocking {
        permitManager.requestPermit(validRequest(type = "ANNUALE", startDate = "2026-06-15"))

        val saved = testDB.fishingPermitCollection.findOne(FishingPermitDocument::startDate eq "2026-06-15")
        assertNotNull(saved)
        assertEquals("2027-06-15", saved!!.endDate) // ANNUALE = start + 365 days (2026 is not a leap year)
        assertEquals(160.0, saved.price)
    }

    @Test
    fun `requestPermit accepts two rods`() = runBlocking {
        permitManager.requestPermit(validRequest(numberOfRods = 2, startDate = "2026-06-20"))

        val saved = testDB.fishingPermitCollection.findOne(FishingPermitDocument::startDate eq "2026-06-20")
        assertNotNull(saved)
        assertEquals(2, saved!!.numberOfRods)
    }

    @Test
    fun `requestPermit with invalid type throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(type = "MENSILE")) }
        Unit
    }

    @Test
    fun `requestPermit with invalid zone throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(zone = "NOWHERE")) }
        Unit
    }

    @Test
    fun `requestPermit with invalid number of rods throws`() = runBlocking {
        // 3 is outside the allowed {1, 2}.
        assertThrows<UserException> { permitManager.requestPermit(validRequest(numberOfRods = 3)) }
        Unit
    }

    @Test
    fun `requestPermit with blank start date throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(startDate = "   ")) }
        Unit
    }

    @Test
    fun `requestPermit with malformed start date throws`() = runBlocking {
        // Wrong format (dd-MM-yyyy instead of yyyy-MM-dd).
        assertThrows<UserException> { permitManager.requestPermit(validRequest(startDate = "10-06-2026")) }
        Unit
    }

    @Test
    fun `requestPermit with negative max catch throws`() = runBlocking {
        // noKill = false so the maxCatch branch is reached.
        assertThrows<UserException> { permitManager.requestPermit(validRequest(maxCatch = -1)) }
        Unit
    }

    @Test
    fun `requestPermit with malformed user id throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(userId = "not-an-object-id")) }
        Unit
    }

    @Test
    fun `requestPermit for non existing user throws`() = runBlocking {
        // Valid ObjectId that is not present in the database.
        assertThrows<UserException> { permitManager.requestPermit(validRequest(userId = ObjectId().toHexString())) }
        Unit
    }

    @Test
    fun `requestPermit for deleted user throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(userId = deletedUserId)) }
        Unit
    }

    @Test
    fun `requestPermit for unverified user throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(userId = unverifiedUserId)) }
        Unit
    }

    @Test
    fun `requestPermit for user without license throws`() = runBlocking {
        assertThrows<UserException> { permitManager.requestPermit(validRequest(userId = noLicenseUserId)) }
        Unit
    }

    @Test
    fun `requestPermit for user with non valid license throws`() = runBlocking {
        // invalidLicenseUser has a PENDING (non-VALID) license.
        assertThrows<UserException> { permitManager.requestPermit(validRequest(userId = invalidLicenseUserId)) }
        Unit
    }

    @Test
    fun `requestPermit with kill permit on a no-kill license throws`() = runBlocking {
        // noKillLicenseUser has a VALID no-kill license; a kill permit (noKill = false) must be rejected.
        assertThrows<UserException> {
            permitManager.requestPermit(validRequest(userId = noKillLicenseUserId, noKill = false))
        }
        Unit
    }

    // ---------------------------------------------------------------------------------------------
    // createPermitAdmin (admin creation)
    // ---------------------------------------------------------------------------------------------

    @Test
    fun `createPermitAdmin persists a free permit`() = runBlocking {
        permitManager.createPermitAdmin(validRequest(type = "GIORNALIERO", startDate = "2026-07-01"))

        val saved = testDB.fishingPermitCollection.findOne(FishingPermitDocument::startDate eq "2026-07-01")
        assertNotNull(saved)
        assertEquals(permitUserId, saved!!.userId)
        assertEquals("ACTIVE", saved.status)
        // admin flow is free regardless of type
        assertEquals(0.0, saved.price)
    }

    @Test
    fun `createPermitAdmin still requires a valid license`() = runBlocking {
        // Admin creation does not bypass the user/license validations.
        assertThrows<UserException> { permitManager.createPermitAdmin(validRequest(userId = noLicenseUserId)) }
        Unit
    }

    // ---------------------------------------------------------------------------------------------
    // getPermitsByUser
    // ---------------------------------------------------------------------------------------------

    @Test
    fun `getPermitsByUser returns all permits owned by the user`() = runBlocking {
        // permitUser owns the two seeded permits.
        val permits = permitManager.getPermitsByUser(permitUserId)

        assertEquals(2, permits.size)
        assertTrue(permits.all { it.userId == permitUserId })
        assertTrue(permits.all { it.permitId.isNotBlank() })
    }

    @Test
    fun `getPermitsByUser returns empty list for a user with no permits`() = runBlocking {
        // Valid, existing user (test@test.com) that owns no permits.
        val permits = permitManager.getPermitsByUser(noLicenseUserId)
        assertTrue(permits.isEmpty())
    }

    @Test
    fun `getPermitsByUser with malformed user id throws`() = runBlocking {
        assertThrows<UserException> { permitManager.getPermitsByUser("not-an-object-id") }
        Unit
    }

    // ---------------------------------------------------------------------------------------------
    // listPermits
    // ---------------------------------------------------------------------------------------------

    @Test
    fun `listPermits returns every permit with correct mapping`() = runBlocking {
        // Only the two seeded permits exist in a fresh database.
        val all = permitManager.listPermits()
        assertEquals(2, all.size)

        // Verify the document -> DTO mapping on a known seed (permitId = hex of the document _id).
        val daily = all.first { it.qrCodeToken == "SEED_PERMIT_DAILY" }
        assertEquals("GIORNALIERO", daily.type)
        assertEquals("ALTO_SARCA", daily.zone)
        assertEquals(permitUserId, daily.userId)
        assertEquals(23.0, daily.price)
        assertEquals("ACTIVE", daily.status)
        assertTrue(daily.permitId.isNotBlank())
    }

    @Test
    fun `listPermits reflects newly created permits`() = runBlocking {
        permitManager.createPermitAdmin(validRequest(startDate = "2026-08-01"))

        // Two seeded + one created.
        assertEquals(3, permitManager.listPermits().size)
    }
}
