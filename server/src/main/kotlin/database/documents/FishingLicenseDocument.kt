package database.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId

@Serializable
class FishingLicenseDocument (
    @Contextual val _id: ObjectId = ObjectId.get(),
    val qrCodeToken: String = "",
    val status: String = "PENDING",
    val licenseNumber: String = "",
    val releasedBy: String = "",
    val season: String = "",
    val noKill: Boolean = false,
    val bookCode: String = "",
    val expirationDate: String = ""
){
    override fun toString(): String {
        return """
{
    "id": "$_id",
    "qrCodeToken": "$qrCodeToken",
    "status": "$status",
    "licenseNumber": "$licenseNumber",
    "releasedBy": "$releasedBy",
    "season": "$season",
    "noKill": $noKill,
    "bookCode": "$bookCode",
    "expirationDate": "$expirationDate"
}
        """.trimIndent()
    }
}