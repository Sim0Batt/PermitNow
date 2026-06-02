package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingPermitDocument
import database.documents.UserDocument
import exceptions.UserException
import org.bson.types.ObjectId
import org.litote.kmongo.and
import org.litote.kmongo.eq
import server.models.input.FishingPermitRequestJson
import server.models.output.FishingPermitJson
import utils.UtilsFunctions
import utils.models.FishingZone
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.logging.Logger

class PermitManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration) {
    val userCollection = connection.userCollection
    val permitCollection = connection.fishingPermitCollection

    val logger = Logger.getLogger(this::class.java.name)

    suspend fun requestPermit(data: FishingPermitRequestJson) {
        // TODO(payment): charge the user before issuing the permit
        createPermit(data, free = false)
    }

    suspend fun createPermitAdmin(data: FishingPermitRequestJson) {
        createPermit(data, free = true)
    }

    suspend fun getPermitsByUser(userId: String): List<FishingPermitJson> {
        try {
            // Validate the userId; an unparsable value is a client error
            try {
                ObjectId(userId)
            } catch (e: IllegalArgumentException) {
                throw UserException("Invalid user id")
            }

            // Ownership is stored as the hex string of the user's ObjectId
            return permitCollection
                .find(FishingPermitDocument::userId eq userId)
                .toList()
                .map { it.toJson() }
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun listPermits(): List<FishingPermitJson> {
        try {
            return permitCollection
                .find()
                .toList()
                .map { it.toJson() }
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    private suspend fun createPermit(data: FishingPermitRequestJson, free: Boolean) {
        try {
            if (data.type !in PERMIT_TYPES) throw UserException("Invalid permit type")
            if (FishingZone.entries.none { it.name == data.zone }) throw UserException("Invalid fishing zone")
            if (data.numberOfRods != 1 && data.numberOfRods != 2) {
                throw UserException("Number of rods must be 1 or 2")
            }

            val startDate = parseStartDate(data.startDate)
            val endDate = computeEndDate(startDate, data.type)

            val objectId = try {
                ObjectId(data.userId)
            } catch (e: IllegalArgumentException) {
                throw UserException("Invalid user id")
            }

            val user = userCollection.findOne(
                and(UserDocument::_id eq objectId, UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            if (!user.verified) throw UserException("User is not verified")

            val license = user.fishingLicense ?: throw UserException("User has no fishing license")
            if (license.status != "VALID") throw UserException("User license is not valid")

            // If the license is no-kill, the permit cannot allow killing
            if (license.noKill && !data.noKill) {
                throw UserException("License is no-kill: permit must be no-kill too")
            }

            // No-kill permits cannot have a catch quota
            val maxCatch = if (data.noKill) {
                0
            } else {
                if (data.maxCatch < 0) throw UserException("Max catch cannot be negative")
                data.maxCatch
            }

            val price = if (free) 0.0 else priceForType(data.type)

            val permit = FishingPermitDocument(
                userId = data.userId,
                licenseId = license._id.toHexString(),
                zone = data.zone,
                type = data.type,
                noKill = data.noKill,
                startDate = startDate.format(DATE_FORMAT),
                endDate = endDate.format(DATE_FORMAT),
                numberOfRods = data.numberOfRods,
                maxCatch = maxCatch,
                price = price,
                status = "ACTIVE",
                qrCodeToken = UtilsFunctions.generateQRCodeToken()
            )

            permitCollection.insertOne(permit)
            logger.info("Fishing Permit created for: ${user.email}")
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    private fun parseStartDate(value: String): LocalDate {
        if (value.isBlank()) throw UserException("Start date cannot be blank")
        return try {
            LocalDate.parse(value, DATE_FORMAT)
        } catch (e: DateTimeParseException) {
            throw UserException("Invalid start date format (expected yyyy-MM-dd)")
        }
    }

    private fun computeEndDate(start: LocalDate, type: String): LocalDate = when (type) {
        "GIORNALIERO" -> start.plusDays(1)
        "SETTIMANALE" -> start.plusDays(7)
        "ANNUALE" -> start.plusDays(365)
        else -> throw UserException("Invalid permit type")
    }

    private fun priceForType(type: String): Double = when (type) {
        "GIORNALIERO" -> 23.0
        "SETTIMANALE" -> 80.0
        "ANNUALE" -> 160.0
        else -> throw UserException("Invalid permit type")
    }

    private fun FishingPermitDocument.toJson(): FishingPermitJson = FishingPermitJson(
        permitId = _id.toHexString(),
        userId = userId,
        licenseId = licenseId,
        zone = zone,
        type = type,
        noKill = noKill,
        startDate = startDate,
        endDate = endDate,
        numberOfRods = numberOfRods,
        maxCatch = maxCatch,
        price = price,
        status = status,
        qrCodeToken = qrCodeToken
    )

    companion object {
        private val PERMIT_TYPES = setOf("GIORNALIERO", "SETTIMANALE", "ANNUALE")
        private val DATE_FORMAT: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    }
}
