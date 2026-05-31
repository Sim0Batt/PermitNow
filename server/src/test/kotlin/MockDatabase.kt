import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.UserDocument
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.TransitionWalker
import managers.UserManager
import org.bson.types.ObjectId
import org.litote.kmongo.coroutine.CoroutineDatabase
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo
import server.permitNowConfiguration

object MockDatabase {
    private lateinit var runningMongo: TransitionWalker.ReachedState<RunningMongodProcess>

    lateinit var testDatabase: CoroutineDatabase



    suspend fun createDatabase(): DatabaseConfig {
        runningMongo = Mongod.instance().start(Version.Main.V7_0)

        val serverAddress = runningMongo.current().serverAddress
        val connectionString = "mongodb://${serverAddress.host}:${serverAddress.port}"

        val config = DatabaseConfig(connectionString, "test_db")

        val client = KMongo.createClient(connectionString).coroutine
        testDatabase = client.getDatabase("test_db")


        val userManager = UserManager(config, permitNowConfiguration)

        val testUser = UserDocument(
            name = "Test",
            surname = "Test",
            email = "test@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("TSTTST00A00A000", permitNowConfiguration.aesKey),
            role = "user",
            verified = true
        )

        val testAdmin = UserDocument(
            name = "Test1",
            surname = "Test1",
            email = "test1@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("TSTTST00A00A000", PermitNowConfiguration.aesKey),
            role = "admin",
            verified = true
        )

        val testUserNonValid = UserDocument(
            name = "Test2",
            surname = "Test2",
            email = "test2@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("TSTTST00A00A000", PermitNowConfiguration.aesKey),
            role = "user",
            verified = false
        )

        val licenseUser = UserDocument(
            name = "Mario",
            surname = "Rossi",
            email = "test2@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("RSSMRA85D15L378K", PermitNowConfiguration.aesKey),
            role = "user",
            verified = true
        )

        config.userCollection.insertMany(listOf(testUser, testAdmin, testUserNonValid, licenseUser))

        // Verifichiamo che ci siano usando la stessa collection
        println("Database created with values: " + config.userCollection.find().toList())

        return config
    }

    suspend fun closeDatabase() {
        if (::testDatabase.isInitialized) {
            testDatabase.drop()
        }

        if (::runningMongo.isInitialized) {
            runningMongo.close()
        }
    }

}