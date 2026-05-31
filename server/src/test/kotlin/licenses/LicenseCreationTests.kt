package licenses

import configuration.PermitNowConfiguration
import database.documents.FishingLicenseDocument
import kotlinx.coroutines.runBlocking
import managers.LicenseManager
import managers.UserManager
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.litote.kmongo.eq
import script.LicenseRecognition
import server.permitNowConfiguration
import java.io.File
import java.io.FileInputStream


@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LicenseCreationTests {

    private lateinit var licenseManager: LicenseManager
    private lateinit var userManager: UserManager
    private lateinit var licenseRecognition: LicenseRecognition

    var testUserId: String = ""
    var notValidUserId: String = ""
    var adminUserId: String = ""
    var licenseUserId: String = ""

    @BeforeEach
    fun init() {
        runBlocking {
            val testDB = MockDatabase.createDatabase()
            userManager = UserManager(testDB, permitNowConfiguration)
            licenseRecognition = LicenseRecognition(permitNowConfiguration, userManager)
            licenseManager = LicenseManager(testDB, permitNowConfiguration, licenseRecognition)


            val userInDb = testDB.userCollection.findOne(database.documents.UserDocument::email eq  "test@test.com")
            testUserId = userInDb?._id?.toHexString() ?: throw IllegalStateException("Mock Database is not initialized")

            val invalidUser = testDB.userCollection.findOne(database.documents.UserDocument::verified eq  false)
            notValidUserId = invalidUser?._id?.toHexString() ?: throw IllegalStateException("Mock Database is not initialized")

            val admin = testDB.userCollection.findOne(database.documents.UserDocument::role eq  "admin")
            adminUserId = admin?._id?.toHexString() ?: throw IllegalStateException("Mock Database is not initialized")

            val licenseUser = testDB.userCollection.findOne(database.documents.UserDocument::name eq  "Mario")
            licenseUserId = licenseUser?._id?.toHexString() ?: throw IllegalStateException("Mock Database is not initialized")
        }
    }

    @AfterEach
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }


    @Test
    fun `Create License with Valid Parameters`() = runBlocking {
        try {
            val validFishingDocument = FishingLicenseDocument(
                qrCodeToken = "VALID_QR_CODE",
                status = "VALID",
                licenseNumber = "123456789",
                releasedBy = "Test User",
                season = "2023-2024",
                noKill = true,
                bookCode = "123456789",
                expirationDate = "2024-01-01"
            )

            licenseManager.addLicense(testUserId, validFishingDocument)
            Assertions.assertTrue(true)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(false, e.message)
        }
    }

    @Test
    fun `Create License for an Invalid User`() = runBlocking {
        try {
            val validFishingDocument = FishingLicenseDocument(
                qrCodeToken = "VALID_QR_CODE",
                status = "VALID",
                licenseNumber = "123456789",
                releasedBy = "Test User",
                season = "2023-2024",
                noKill = true,
                bookCode = "123456789",
                expirationDate = "2024-01-01"
            )

            licenseManager.addLicense("-1", validFishingDocument)
            Assertions.assertTrue(false)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

    @Test
    fun `Create Multiple License for an User`() = runBlocking {
        try {
            val validFishingDocument = FishingLicenseDocument(
                qrCodeToken = "VALID_QR_CODE",
                status = "VALID",
                licenseNumber = "123456789",
                releasedBy = "Test User",
                season = "2023-2024",
                noKill = true,
                bookCode = "123456789",
                expirationDate = "2024-01-01"
            )

            licenseManager.addLicense(testUserId, validFishingDocument)
            licenseManager.addLicense(testUserId, validFishingDocument)
            Assertions.assertTrue(false)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }


    @Test
    fun `Create a License for an Invalid User`() = runBlocking {
        try {
            val validFishingDocument = FishingLicenseDocument(
                qrCodeToken = "VALID_QR_CODE",
                status = "VALID",
                licenseNumber = "123456789",
                releasedBy = "Test User",
                season = "2023-2024",
                noKill = true,
                bookCode = "123456789",
                expirationDate = "2024-01-01"
            )

            licenseManager.addLicense(notValidUserId, validFishingDocument)
            Assertions.assertTrue(false)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

    @Test
    fun `Create a License for an Admin`() = runBlocking {
        try {
            val validFishingDocument = FishingLicenseDocument(
                qrCodeToken = "VALID_QR_CODE",
                status = "VALID",
                licenseNumber = "123456789",
                releasedBy = "Test User",
                season = "2023-2024",
                noKill = true,
                bookCode = "123456789",
                expirationDate = "2024-01-01"
            )

            licenseManager.addLicense(adminUserId, validFishingDocument)
            Assertions.assertTrue(false)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

    @Test
    fun `Valid Recognition`() = runBlocking {
        try {
            val testImage = File("src/test/resources/license/valid_license.png")
            val licenseDocument = licenseRecognition.readFishingLicense(
                userManager.getUserInfo(licenseUserId),
                testImage
            )
            licenseManager.addLicense(licenseUserId, licenseDocument)
            Assertions.assertTrue(true)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(false, e.message)
        }
    }

    @Test
    fun `Invalid Image Recognition`() = runBlocking {
        try {
            val testImage = File("src/test/resources/license/error.png")
            val licenseDocument = licenseRecognition.readFishingLicense(
                userManager.getUserInfo(licenseUserId),
                testImage
            )
            licenseManager.addLicense(licenseUserId, licenseDocument)
            Assertions.assertTrue(false)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(true, e.message)
        }
    }

    @Test
    fun `Different Fiscal Code Image Recognition`() = runBlocking {
        try {
            val testImage = File("src/test/resources/license/valid_png.png")
            val licenseDocument = licenseRecognition.readFishingLicense(
                userManager.getUserInfo(testUserId),
                testImage
            )
            licenseManager.addLicense(testUserId, licenseDocument)
            Assertions.assertTrue(false)
        }catch (e: Exception){
            println(e)
            Assertions.assertTrue(true, e.message)
        }
    }


}