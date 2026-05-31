package database

import database.documents.FishingLicenseDocument
import database.documents.UserDocument
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo

class DatabaseConfig(val connectionUrl: String, val dbName: String) {
    val client = KMongo.createClient(connectionUrl).coroutine

    val database = client.getDatabase(dbName)

    val userCollection = database.getCollection<UserDocument>("users")
    val fishingCollection = database.getCollection<FishingLicenseDocument>("fishing_licenses")
}