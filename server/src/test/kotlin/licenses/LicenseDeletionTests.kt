package licenses

import database.DatabaseConfig
import database.documents.FishingLicenseDocument
import database.documents.UserDocument
import exceptions.UserException
import kotlinx.coroutines.runBlocking
import managers.LicenseManager
import managers.UserManager
import org.bson.types.ObjectId
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.litote.kmongo.eq
import org.litote.kmongo.setValue
import script.LicenseRecognition
import server.permitNowConfiguration

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LicenseDeletionTests {

    private lateinit var testDB: DatabaseConfig
    private lateinit var licenseManager: LicenseManager

    // Verified seed user with a VALID embedded fishing license.
    private var permitUserId: String = ""
    // Soft-deleted seed user (deleted = true).
    private var deletedUserId: String = ""
    // Verified seed user with no fishing license.
    private var noLicenseUserId: String = ""

    @BeforeEach
    fun init() {
        runBlocking {
            testDB = MockDatabase.createDatabase()
            val userManager = UserManager(testDB, permitNowConfiguration)
            val licenseRecognition = LicenseRecognition(permitNowConfiguration, userManager)
            licenseManager = LicenseManager(testDB, permitNowConfiguration, licenseRecognition)

            val permitUser = testDB.userCollection.findOne(UserDocument::email eq "permit@test.com")
            permitUserId = permitUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user permit@test.com is missing")

            val deletedUser = testDB.userCollection.findOne(UserDocument::deleted eq true)
            deletedUserId = deletedUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user with deleted = true is missing")

            val noLicenseUser = testDB.userCollection.findOne(UserDocument::email eq "test@test.com")
            noLicenseUserId = noLicenseUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user test@test.com is missing")
        }
    }

    @AfterEach
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }

    @Test
    fun `delete license of verified user with valid license removes it from db`() = runBlocking {
        licenseManager.deleteLicense(permitUserId)

        val user = testDB.userCollection.findOne(UserDocument::_id eq ObjectId(permitUserId))
        assertNull(user?.fishingLicense)
    }

    @Test
    fun `delete license with malformed user id throws`() = runBlocking {
        assertThrows<UserException> { licenseManager.deleteLicense("not-an-object-id") }
        Unit
    }

    @Test
    fun `delete license for non-existing user throws`() = runBlocking {
        assertThrows<UserException> { licenseManager.deleteLicense(ObjectId().toHexString()) }
        Unit
    }

    @Test
    fun `delete license for soft-deleted user throws`() = runBlocking {
        assertThrows<UserException> { licenseManager.deleteLicense(deletedUserId) }
        Unit
    }

    @Test
    fun `delete license for user with no license throws`() = runBlocking {
        assertThrows<UserException> { licenseManager.deleteLicense(noLicenseUserId) }
        Unit
    }

    @Test
    fun `delete license twice throws on second call`() = runBlocking {
        licenseManager.deleteLicense(permitUserId)

        assertThrows<UserException> { licenseManager.deleteLicense(permitUserId) }
        Unit
    }

    @Test
    fun `delete license with status already deleted throws`() = runBlocking {
        val user = testDB.userCollection.findOne(UserDocument::_id eq ObjectId(permitUserId))!!
        val license = user.fishingLicense!!
        val alreadyDeleted = FishingLicenseDocument(
            _id = license._id,
            qrCodeToken = license.qrCodeToken,
            status = "DELETED",
            licenseNumber = license.licenseNumber,
            releasedBy = license.releasedBy,
            season = license.season,
            noKill = license.noKill,
            bookCode = license.bookCode,
            expirationDate = license.expirationDate
        )
        testDB.userCollection.updateOne(
            UserDocument::_id eq ObjectId(permitUserId),
            setValue(UserDocument::fishingLicense, alreadyDeleted)
        )

        assertThrows<UserException> { licenseManager.deleteLicense(permitUserId) }
        Unit
    }
}
