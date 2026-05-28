package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingLicenseDocument
import database.documents.UserDocument
import org.bson.types.ObjectId
import org.litote.kmongo.setValue

class LicenseManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration) {
    val userCollection = connection.userCollection
    val licenseCollection = connection.fishingCollection

    suspend fun addLicense(document: FishingLicenseDocument, userId: String) {
        licenseCollection.insertOne(document)
        userCollection.updateOneById(ObjectId(userId), setValue(UserDocument::fishingLicense, document))
    }


}