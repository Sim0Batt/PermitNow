package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class FishingLicenseInfoJson(
    val id: String,
    val qrCodeToken: String = "",
    val status: String = "PENDING",
    val licenseNumber: String = "",
    val releasedBy: String = "",
    val season: String = "",
    val noKill: Boolean = false,
    val bookCode: String = "",
    val expirationDate: String = ""
) {
    override fun toString(): String {
        return """
{
    "id": "$id",
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