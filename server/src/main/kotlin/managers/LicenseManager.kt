package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingLicenseDocument
import database.documents.UserDocument
import exceptions.FishingLicenseException
import exceptions.UserException
import org.bson.types.ObjectId
import org.litote.kmongo.and
import org.litote.kmongo.eq
import org.litote.kmongo.setValue
import script.LicenseRecognition
import server.models.output.FishingLicenseInfoJson
import java.util.logging.Logger

class LicenseManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration, val licenseRecognition: LicenseRecognition) {
    val userCollection = connection.userCollection
    val licenseCollection = connection.fishingCollection
    val booksManager = BooksManager(connection, permitNowConfiguration)

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
            booksManager.createNewPage(fishingDocument.bookCode)

            logger.info("Fishing Licence Added to: ${user.email}")
        }catch (e: Exception){
            e.printStackTrace()
            throw IllegalStateException(e.message.toString())
        }
    }

    suspend fun deleteLicense(userId: String) {
        try {
            logger.info("Starting Fishing License deletion process")

            // Parse the userId; an unparsable value is a client error
            val objectId = try {
                ObjectId(userId)
            } catch (e: IllegalArgumentException) {
                throw UserException("Invalid user id")
            }

            val user = userCollection.findOne(
                and(UserDocument::_id eq objectId, UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            val license = user.fishingLicense ?: throw UserException("License not found")

            if (license.status == "DELETED") throw UserException("License already deleted")

            // Soft delete: mark the license document and detach it from the user
            licenseCollection.updateOne(
                FishingLicenseDocument::_id eq license._id,
                setValue(FishingLicenseDocument::status, "DELETED")
            )
            userCollection.updateOne(
                UserDocument::_id eq objectId,
                setValue(UserDocument::fishingLicense, null)
            )

            logger.info("Fishing License deleted for: ${user.email}")
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun getLicenseInfo(userId: String): FishingLicenseInfoJson{
        try{
            val license = userCollection.findOne(FishingLicenseDocument::_id eq ObjectId(userId)).let { user ->
                FishingLicenseInfoJson(
                    user!!.fishingLicense!!._id.toString(),
                    user.fishingLicense.qrCodeToken,
                    user.fishingLicense.status,
                    user.fishingLicense.licenseNumber,
                    user.fishingLicense.releasedBy,
                    user.fishingLicense.season,
                    user.fishingLicense.noKill,
                    user.fishingLicense.bookCode,
                    user.fishingLicense.expirationDate
                )
            }
            logger.info("Sending License info:\n $license")
            return license

        }catch (e: Exception){
            e.printStackTrace()
            throw FishingLicenseException("License not Found: " + e.message.toString())
        }
    }


}