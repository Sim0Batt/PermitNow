package database

import database.documents.FishingBookRowDocument
import database.documents.FishingLicenseDocument
import database.documents.FishingPageDocument
import database.documents.FishingPermitDocument
import database.documents.UserDocument
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo

class DatabaseConfig(val connectionUrl: String, val dbName: String) {
    val client = KMongo.createClient(connectionUrl).coroutine

    val database = client.getDatabase(dbName)

    val userCollection = database.getCollection<UserDocument>("users")
    val fishingPagesCollection = database.getCollection<FishingPageDocument>("fishing_pages")
    val fishingRowsCollection = database.getCollection<FishingBookRowDocument>("fishing_rows")
    val fishingPermitCollection = database.getCollection<FishingPermitDocument>("fishing_permits")
}