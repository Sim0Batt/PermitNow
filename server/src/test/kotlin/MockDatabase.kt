import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingLicenseDocument
import database.documents.FishingPermitDocument
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

        // TODO(seed bugs): testUserNonValid and licenseUser share email "test2@test.com" (duplicate),
        //  and several seeds use the 15-char fiscalCode "TSTTST00A00A000" (should be 16). Left as-is on purpose.
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

        val deletedUser = UserDocument(
            name = "Deleted",
            surname = "Deleted",
            email = "deleted@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("TSTTST00A00A000", PermitNowConfiguration.aesKey),
            role = "user",
            verified = true,
            deleted = true
        )

        // Verified user WITH a valid embedded fishing license, used to exercise permit creation
        // (createPermit requires user.fishingLicense.status == "VALID"). noKill = false so the
        // license allows both kill and no-kill permits. Unique email and 16-char fiscalCode.
        val permitLicense = FishingLicenseDocument(
            qrCodeToken = "PERMIT_USER_QR",
            status = "VALID",
            licenseNumber = "PRM-0001",
            releasedBy = "Test",
            season = "2025-2026",
            noKill = false,
            bookCode = "BOOK-0001",
            expirationDate = "2026-12-31"
        )

        val permitUser = UserDocument(
            name = "Permit",
            surname = "User",
            email = "permit@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("PRMUSR00A00A000A", permitNowConfiguration.aesKey),
            role = "user",
            verified = true,
            fishingLicense = permitLicense
        )

        // Verified user whose embedded license is NOT valid (status "PENDING"): used to exercise the
        // "User license is not valid" branch of createPermit.
        val invalidLicense = FishingLicenseDocument(
            qrCodeToken = "INVALID_LICENSE_QR",
            status = "PENDING",
            licenseNumber = "PRM-0002",
            releasedBy = "Test",
            season = "2025-2026",
            noKill = false,
            bookCode = "BOOK-0002",
            expirationDate = "2026-12-31"
        )

        val invalidLicenseUser = UserDocument(
            name = "Invalid",
            surname = "License",
            email = "invalid-license@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("NVLLCN00A00A000A", permitNowConfiguration.aesKey),
            role = "user",
            verified = true,
            fishingLicense = invalidLicense
        )

        // Verified user whose VALID license is no-kill: used to exercise the
        // "License is no-kill: permit must be no-kill too" branch of createPermit.
        val noKillLicense = FishingLicenseDocument(
            qrCodeToken = "NOKILL_LICENSE_QR",
            status = "VALID",
            licenseNumber = "PRM-0003",
            releasedBy = "Test",
            season = "2025-2026",
            noKill = true,
            bookCode = "BOOK-0003",
            expirationDate = "2026-12-31"
        )

        val noKillLicenseUser = UserDocument(
            name = "NoKill",
            surname = "License",
            email = "nokill-license@test.com",
            password = userManager.hashPassword("test"),
            fiscalCode = userManager.encryptFiscalCode("NKLLCN00A00A000A", permitNowConfiguration.aesKey),
            role = "user",
            verified = true,
            fishingLicense = noKillLicense
        )

        config.userCollection.insertMany(
            listOf(
                testUser, testAdmin, testUserNonValid, licenseUser, deletedUser,
                permitUser, invalidLicenseUser, noKillLicenseUser
            )
        )

        // Pre-seeded permits owned by permitUser, with different types to cover document->DTO mapping
        // for listPermits / getPermitsByUser without depending on the creation flow.
        val permitUserId = permitUser._id.toHexString()
        val seedPermitDaily = FishingPermitDocument(
            userId = permitUserId,
            licenseId = permitLicense._id.toHexString(),
            zone = "ALTO_SARCA",
            type = "GIORNALIERO",
            noKill = false,
            startDate = "2026-01-01",
            endDate = "2026-01-02",
            numberOfRods = 1,
            maxCatch = 5,
            price = 23.0,
            status = "ACTIVE",
            qrCodeToken = "SEED_PERMIT_DAILY"
        )
        val seedPermitWeekly = FishingPermitDocument(
            userId = permitUserId,
            licenseId = permitLicense._id.toHexString(),
            zone = "BASSO_SARCA",
            type = "SETTIMANALE",
            noKill = true,
            startDate = "2026-02-01",
            endDate = "2026-02-08",
            numberOfRods = 2,
            maxCatch = 0,
            price = 80.0,
            status = "ACTIVE",
            qrCodeToken = "SEED_PERMIT_WEEKLY"
        )

        config.fishingPermitCollection.insertMany(listOf(seedPermitDaily, seedPermitWeekly))

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