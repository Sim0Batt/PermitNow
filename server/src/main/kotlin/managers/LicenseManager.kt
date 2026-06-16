package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingLicenseDocument
import database.documents.UserDocument
import exceptions.UserException
import org.bson.types.ObjectId
import org.litote.kmongo.and
import org.litote.kmongo.combine
import org.litote.kmongo.eq
import org.litote.kmongo.ne
import org.litote.kmongo.setValue
import script.LicenseRecognition
import server.models.input.AdminCreateFishingLicenseJson
import server.models.input.UpdateFishingLicenseJson
import server.models.output.FishingLicenseJson
import server.models.output.LicenseListItemJson
import utils.UtilsFunctions
import java.util.logging.Logger

class LicenseManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration, val licenseRecognition: LicenseRecognition) {
    val userCollection = connection.userCollection
    val booksManager = BooksManager(connection, permitNowConfiguration)

    val logger = Logger.getLogger(this::class.java.name)


    suspend fun addLicense(userId: String, fishingDocument: FishingLicenseDocument) {
        try{
            logger.info("Starting Fishing License addition process")

            val user = userCollection.findOne(and(UserDocument::_id eq ObjectId(userId), UserDocument::deleted eq false))
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

            userCollection.updateOneById(ObjectId(userId), setValue(UserDocument::fishingLicense, fishingDocument))
            booksManager.createNewPage(userId)

            logger.info("Fishing Licence Added to: ${user.email}")
        }catch (e: Exception){
            e.printStackTrace()
            throw IllegalStateException(e.message.toString())
        }
    }

    suspend fun listLicenses(): List<LicenseListItemJson> {
        try {
            return userCollection
                .find(and(UserDocument::deleted eq false, UserDocument::fishingLicense ne null))
                .toList()
                .mapNotNull { user ->
                    val license = user.fishingLicense ?: return@mapNotNull null
                    LicenseListItemJson(
                        userId = user._id.toHexString(),
                        name = user.name,
                        surname = user.surname,
                        email = user.email,
                        qrCodeToken = license.qrCodeToken,
                        status = license.status,
                        licenseNumber = license.licenseNumber,
                        releasedBy = license.releasedBy,
                        season = license.season,
                        noKill = license.noKill,
                        bookCode = license.bookCode,
                        expirationDate = license.expirationDate
                    )
                }
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun createLicenseManually(data: AdminCreateFishingLicenseJson) {
        try {
            if (data.userId.isBlank()) throw UserException("User id cannot be blank")
            if (data.licenseNumber.isBlank()) throw UserException("License number cannot be blank")
            if (data.season.isBlank()) throw UserException("Season cannot be blank")
            if (data.expirationDate.isBlank()) throw UserException("Expiration date cannot be blank")

            val fishingDocument = FishingLicenseDocument(
                qrCodeToken = UtilsFunctions.generateQRCodeToken(),
                status = "VALID",
                licenseNumber = data.licenseNumber,
                releasedBy = data.releasedBy,
                season = data.season,
                noKill = data.noKill,
                bookCode = data.bookCode,
                expirationDate = data.expirationDate
            )

            addLicense(data.userId, fishingDocument)
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun getLicense(userId: String): FishingLicenseJson {
        try {
            val objectId = try {
                ObjectId(userId)
            } catch (e: IllegalArgumentException) {
                throw UserException("Invalid user id")
            }

            val user = userCollection.findOne(
                and(UserDocument::_id eq objectId, UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            val license = user.fishingLicense ?: throw UserException("License not found")

            return FishingLicenseJson(
                qrCodeToken = license.qrCodeToken,
                status = license.status,
                licenseNumber = license.licenseNumber,
                releasedBy = license.releasedBy,
                season = license.season,
                noKill = license.noKill,
                bookCode = license.bookCode,
                expirationDate = license.expirationDate
            )
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun updateLicense(userId: String, data: UpdateFishingLicenseJson) {
        try {
            if (data.licenseNumber.isBlank()) throw UserException("License number cannot be blank")
            if (data.season.isBlank()) throw UserException("Season cannot be blank")
            if (data.expirationDate.isBlank()) throw UserException("Expiration date cannot be blank")

            val objectId = try {
                ObjectId(userId)
            } catch (e: IllegalArgumentException) {
                throw UserException("Invalid user id")
            }

            val user = userCollection.findOne(
                and(UserDocument::_id eq objectId, UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            val license = user.fishingLicense ?: throw UserException("License not found")

            if (license.status == "DELETED") throw UserException("Cannot update a deleted license")

            // Preserve identity (_id, qrCodeToken) and status; only content fields change
            val updated = FishingLicenseDocument(
                _id = license._id,
                qrCodeToken = license.qrCodeToken,
                status = data.status,
                licenseNumber = data.licenseNumber,
                releasedBy = data.releasedBy,
                season = data.season,
                noKill = data.noKill,
                bookCode = data.bookCode,
                expirationDate = data.expirationDate
            )

            // Sync embedded copy on the user
            userCollection.updateOne(
                UserDocument::_id eq objectId,
                setValue(UserDocument::fishingLicense, updated)
            )

            logger.info("Fishing License updated for: ${user.email}")
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
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
}
