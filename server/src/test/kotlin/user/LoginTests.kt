package user

import configuration.PermitNowConfiguration
import configuration.ReadXMLResources
import kotlinx.coroutines.runBlocking
import managers.UserManager
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.litote.kmongo.eq
import server.models.input.LoginJson
import server.permitNowConfiguration

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LoginTests {

    private lateinit var userManager: UserManager

    var testUserId: String = ""


    @BeforeAll
    fun init() {
        runBlocking {
            val testDB = MockDatabase.createDatabase()
            userManager = UserManager(testDB, permitNowConfiguration)
            val userInDb = testDB.userCollection.findOne(database.documents.UserDocument::email eq  "test@test.com")
            testUserId = userInDb?._id?.toHexString() ?: throw IllegalStateException("Mock Database is not initialized")
        }
    }

    @AfterAll
    fun close() = runBlocking {
        MockDatabase.closeDatabase()
    }



    @Test
    fun `Valid Credentials Login Test`() = runBlocking {
        val email = "test@test.com"
        val password = "test"
        val result = userManager.login(LoginJson(email, password))

        println("Query Result: $result")
        Assertions.assertNotNull(result)
        Assertions.assertEquals(testUserId, result)
    }

    @Test
    fun `Invalid Email Login`() = runBlocking {
        val email = "error@test.com"
        val password = "test"
        try{
            userManager.login(LoginJson(email, password))
            Assertions.assertTrue(false)
        }catch(e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

    @Test
    fun `Invalid Password Login`() = runBlocking {
        val email = "test@test.com"
        val password = "error"
        try{
            userManager.login(LoginJson(email, password))
            Assertions.assertTrue(false)
        }catch(e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

    @Test
    fun `Empty Email Login`() = runBlocking {
        val email = ""
        val password = "test"
        try{
            userManager.login(LoginJson(email, password))
            Assertions.assertTrue(false)
        }catch(e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

    @Test
    fun `Empty Password Login`() = runBlocking {
        val email = "test@test.com"
        val password = ""
        try{
            userManager.login(LoginJson(email, password))
            Assertions.assertTrue(false)
        }catch(e: Exception){
            println(e)
            Assertions.assertTrue(true)
        }
    }

}