package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingLicenseDocument
import database.documents.UserDocument
import org.bson.types.ObjectId
import org.litote.kmongo.eq
import org.litote.kmongo.setValue
import script.LicenseRecognition
import java.util.logging.Logger

class LicenseManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration, val licenseRecognition: LicenseRecognition) {
    val userCollection = connection.userCollection
    val licenseCollection = connection.fishingCollection

    val logger = Logger.getLogger(this::class.java.name)


    suspend fun addLicense(userId: String, fishingDocument: FishingLicenseDocument) {
        try{
            logger.info("Starting Fishing License addition process")

            val user = userCollection.findOne(UserDocument::_id eq ObjectId(userId))
                ?: throw IllegalStateException("User not found")

            if (user.fishingLicense != null) {
                logger.warning("User already has a fishing license")
                throw IllegalStateException("User already has a fishing license")
            }
            if (!user.verified) {
                logger.warning("User is not verified")
                throw IllegalStateException("User is not verified")
            }
            if (user.role != "user") {
                logger.warning("User is not a user")
                throw IllegalStateException("User is not a user")
            }

            licenseCollection.insertOne(fishingDocument)
            userCollection.updateOneById(ObjectId(userId), setValue(UserDocument::fishingLicense, fishingDocument))

            logger.info("Fishing Licence Added to: ${user.email}")
        }catch (e: Exception){
            e.printStackTrace()
            throw IllegalStateException(e.message.toString())
        }
    }


}