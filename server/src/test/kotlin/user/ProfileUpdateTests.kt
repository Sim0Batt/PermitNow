package user

import database.DatabaseConfig
import database.documents.UserDocument
import exceptions.UserException
import kotlinx.coroutines.runBlocking
import managers.UserManager
import org.bson.types.ObjectId
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.litote.kmongo.eq
import server.models.input.ProfileUpdateJson
import server.permitNowConfiguration

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ProfileUpdateTests {

    private lateinit var testDB: DatabaseConfig
    private lateinit var userManager: UserManager

    // Verified seed user (name "Test"): only the email may change.
    private var verifiedUserId: String = ""
    // Unverified seed user (name "Test2"): all profile fields may change.
    private var unverifiedUserId: String = ""
    // Soft-deleted seed user (deleted = true).
    private var deletedUserId: String = ""

    // A fiscal code matching the manager's regex (used for valid unverified updates).
    private val validFiscalCode = "RSSMRA85D15L378K"

    @BeforeEach
    fun init() {
        runBlocking {
            testDB = MockDatabase.createDatabase()
            userManager = UserManager(testDB, permitNowConfiguration)

            val verified = testDB.userCollection.findOne(UserDocument::name eq "Test")
            verifiedUserId = verified?._id?.toHexString()
                ?: throw IllegalStateException("Verified seed user 'Test' is missing")

            val unverified = testDB.userCollection.findOne(UserDocument::name eq "Test2")
            unverifiedUserId = unverified?._id?.toHexString()
                ?: throw IllegalStateException("Unverified seed user 'Test2' is missing")

            val deleted = testDB.userCollection.findOne(UserDocument::deleted eq true)
            deletedUserId = deleted?._id?.toHexString()
                ?: throw IllegalStateException("Seed user with deleted = true is missing")
        }
    }

    @AfterEach
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }

    @Test
    fun `update profile of unverified user persists all fields`() = runBlocking {
        val data = ProfileUpdateJson(
            name = "Updated",
            surname = "User",
            email = "updated@test.com",
            fiscalCode = validFiscalCode
        )

        userManager.updateProfile(unverifiedUserId, data)

        val updated = testDB.userCollection.findOne(UserDocument::_id eq ObjectId(unverifiedUserId))
        assertEquals("Updated", updated?.name)
        assertEquals("User", updated?.surname)
        assertEquals("updated@test.com", updated?.email)
        assertEquals(validFiscalCode, userManager.decryptFiscalCode(updated!!.fiscalCode))
    }

    @Test
    fun `update profile of verified user changes only email`() = runBlocking {
        // For a verified user, name/surname/fiscalCode must be passed unchanged.
        val data = ProfileUpdateJson(
            name = "Test",
            surname = "Test",
            email = "verified-new@test.com",
            fiscalCode = "TSTTST00A00A000"
        )

        userManager.updateProfile(verifiedUserId, data)

        val updated = testDB.userCollection.findOne(UserDocument::_id eq ObjectId(verifiedUserId))
        assertEquals("verified-new@test.com", updated?.email)
        assertEquals("Test", updated?.name)
        assertEquals("Test", updated?.surname)
    }

    @Test
    fun `update profile of deleted user throws`() = runBlocking {
        val data = ProfileUpdateJson(
            name = "Deleted",
            surname = "Deleted",
            email = "still-deleted@test.com",
            fiscalCode = "TSTTST00A00A000"
        )
        assertThrows<UserException> {
            userManager.updateProfile(deletedUserId, data)
        }
        Unit
    }

    @Test
    fun `update profile with blank email throws`() = runBlocking {
        val data = ProfileUpdateJson(
            name = "Updated",
            surname = "User",
            email = "   ",
            fiscalCode = validFiscalCode
        )
        assertThrows<UserException> {
            userManager.updateProfile(unverifiedUserId, data)
        }
        Unit
    }

    @Test
    fun `update profile with invalid email format throws`() = runBlocking {
        val data = ProfileUpdateJson(
            name = "Updated",
            surname = "User",
            email = "not-an-email",
            fiscalCode = validFiscalCode
        )
        assertThrows<UserException> {
            userManager.updateProfile(unverifiedUserId, data)
        }
        Unit
    }

    @Test
    fun `update profile of unverified user with blank name throws`() = runBlocking {
        val data = ProfileUpdateJson(
            name = "   ",
            surname = "User",
            email = "updated@test.com",
            fiscalCode = validFiscalCode
        )
        assertThrows<UserException> {
            userManager.updateProfile(unverifiedUserId, data)
        }
        Unit
    }

    @Test
    fun `update profile of unverified user with invalid fiscal code throws`() = runBlocking {
        val data = ProfileUpdateJson(
            name = "Updated",
            surname = "User",
            email = "updated@test.com",
            fiscalCode = "INVALID"
        )
        assertThrows<UserException> {
            userManager.updateProfile(unverifiedUserId, data)
        }
        Unit
    }

    @Test
    fun `update profile of verified user modifying immutable field throws`() = runBlocking {
        // A verified user cannot change name/surname/fiscalCode (SPID-locked fields).
        val data = ProfileUpdateJson(
            name = "ChangedName",
            surname = "Test",
            email = "verified-new@test.com",
            fiscalCode = "TSTTST00A00A000"
        )
        assertThrows<UserException> {
            userManager.updateProfile(verifiedUserId, data)
        }
        Unit
    }
}
