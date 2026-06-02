package user

import database.DatabaseConfig
import database.documents.UserDocument
import exceptions.UserException
import kotlinx.coroutines.runBlocking
import managers.UserManager
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.bson.types.ObjectId
import org.litote.kmongo.eq
import server.models.input.LoginJson
import server.permitNowConfiguration

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ChangePasswordTests {

    private lateinit var testDB: DatabaseConfig
    private lateinit var userManager: UserManager

    // Verified seed user (email "test@test.com", password "test").
    private var testUserId: String = ""
    // Soft-deleted seed user (deleted = true).
    private var deletedUserId: String = ""

    @BeforeEach
    fun init() {
        runBlocking {
            testDB = MockDatabase.createDatabase()
            userManager = UserManager(testDB, permitNowConfiguration)

            val testUser = testDB.userCollection.findOne(UserDocument::email eq "test@test.com")
            testUserId = testUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user test@test.com is missing")

            val deletedUser = testDB.userCollection.findOne(UserDocument::deleted eq true)
            deletedUserId = deletedUser?._id?.toHexString()
                ?: throw IllegalStateException("Seed user with deleted = true is missing")
        }
    }

    @AfterEach
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }

    @Test
    fun `change password with valid credentials updates db password field`() = runBlocking {
        val originalHash = testDB.userCollection.findOne(UserDocument::_id eq ObjectId(testUserId))?.password

        userManager.changePassword(testUserId, "test", "newpassword123")

        // The password is hashed with a random salt, so we cannot assert a known value;
        // instead we assert the stored hash changed and that the new password authenticates.
        val updated = testDB.userCollection.findOne(UserDocument::_id eq ObjectId(testUserId))
        assertNotEquals(originalHash, updated?.password)

        val loginResult = userManager.login(LoginJson("test@test.com", "newpassword123"))
        assertEquals(testUserId, loginResult)
    }

    @Test
    fun `change password with blank new password throws`() = runBlocking {
        assertThrows<UserException> {
            userManager.changePassword(testUserId, "test", "   ")
        }
        Unit
    }

    @Test
    fun `change password with blank current password throws`() = runBlocking {
        assertThrows<UserException> {
            userManager.changePassword(testUserId, "   ", "newpassword123")
        }
        Unit
    }

    @Test
    fun `change password with new password shorter than 8 chars throws`() = runBlocking {
        // Boundary: 7 characters is one below the minimum length of 8.
        assertThrows<UserException> {
            userManager.changePassword(testUserId, "test", "abcdef1")
        }
        Unit
    }

    @Test
    fun `change password equal to current password throws`() = runBlocking {
        // First move to a password long enough to get past the length gate,
        // so the "must differ" branch can be reached in isolation.
        userManager.changePassword(testUserId, "test", "samepass123")

        assertThrows<UserException> {
            userManager.changePassword(testUserId, "samepass123", "samepass123")
        }
        Unit
    }

    @Test
    fun `change password with malformed user id throws`() = runBlocking {
        assertThrows<UserException> {
            userManager.changePassword("not-an-object-id", "test", "newpassword123")
        }
        Unit
    }

    @Test
    fun `change password for deleted user throws`() = runBlocking {
        // A soft-deleted user is excluded by the deleted = false filter and must not be updatable.
        assertThrows<UserException> {
            userManager.changePassword(deletedUserId, "test", "newpassword123")
        }
        Unit
    }

    @Test
    fun `change password with wrong current password throws`() = runBlocking {
        assertThrows<UserException> {
            userManager.changePassword(testUserId, "wrongcurrent", "newpassword123")
        }
        Unit
    }
}
