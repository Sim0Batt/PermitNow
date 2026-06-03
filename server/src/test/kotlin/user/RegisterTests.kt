package user

import database.DatabaseConfig
import database.documents.UserDocument
import exceptions.UserException
import kotlinx.coroutines.runBlocking
import managers.UserManager
import org.bson.types.ObjectId
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.litote.kmongo.eq
import server.models.input.RegisterJson
import server.permitNowConfiguration

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RegisterTests {

    private lateinit var testDB: DatabaseConfig
    private lateinit var userManager: UserManager

    @BeforeEach
    fun init() {
        runBlocking {
            testDB = MockDatabase.createDatabase()
            userManager = UserManager(testDB, permitNowConfiguration)
        }
    }

    @AfterEach
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }

    @Test
    fun `register with valid data persists user and returns valid id`() = runBlocking {
        val fiscalCode = "RSSMRA80A01H501Z"
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "test@example.com",
            password = "Password123!",
            fiscalCode = fiscalCode,
            role = "user"
        )

        val returnedId = userManager.register(data)

        // The returned id must be a valid 24-hex ObjectId.
        assertTrue(ObjectId.isValid(returnedId))

        val persisted = testDB.userCollection.findOne(UserDocument::email eq "test@example.com")
        assertEquals(returnedId, persisted?._id?.toHexString())
        assertEquals("Mario", persisted?.name)
        assertEquals("Rossi", persisted?.surname)
        assertEquals("test@example.com", persisted?.email)
        assertEquals("user", persisted?.role)

        // The fiscal code is stored AES-encrypted, never as plaintext, and must decrypt back.
        assertNotEquals(fiscalCode, persisted?.fiscalCode)
        assertEquals(fiscalCode, userManager.decryptFiscalCode(persisted!!.fiscalCode))
    }

    @Test
    fun `register with an already used email throws`() = runBlocking {
        // test@test.com is a seeded user, so a second registration must be rejected.
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "test@test.com",
            password = "Password123!",
            fiscalCode = "RSSMRA80A01H501Z",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    fun `register with empty fiscal code throws`() = runBlocking {
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "test@example.com",
            password = "Password123!",
            fiscalCode = "",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    fun `register with empty email throws`() = runBlocking {
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "",
            password = "Password123!",
            fiscalCode = "RSSMRA80A01H501Z",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    fun `register with empty password throws`() = runBlocking {
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "test@example.com",
            password = "",
            fiscalCode = "RSSMRA80A01H501Z",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    fun `register with empty name throws`() = runBlocking {
        val data = RegisterJson(
            name = "",
            surname = "Rossi",
            email = "test@example.com",
            password = "Password123!",
            fiscalCode = "RSSMRA80A01H501Z",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    fun `register with empty surname throws`() = runBlocking {
        val data = RegisterJson(
            name = "Mario",
            surname = "",
            email = "test@example.com",
            password = "Password123!",
            fiscalCode = "RSSMRA80A01H501Z",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    @Disabled("TODO(constraints): fiscalCode format validation not yet implemented")
    fun `register with malformed fiscal code throws`() = runBlocking {
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "test@example.com",
            password = "Password123!",
            fiscalCode = "RSSMRA",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }

    @Test
    @Disabled("TODO(constraints): email format validation not yet implemented")
    fun `register with malformed email throws`() = runBlocking {
        val data = RegisterJson(
            name = "Mario",
            surname = "Rossi",
            email = "error",
            password = "Password123!",
            fiscalCode = "RSSMRA80A01H501Z",
            role = "user"
        )

        assertThrows<UserException> {
            userManager.register(data)
        }
        Unit
    }
}
