package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class LicenseListItemJson(
    val userId: String,
    val name: String,
    val surname: String,
    val email: String,
    val qrCodeToken: String,
    val status: String,
    val licenseNumber: String,
    val releasedBy: String,
    val season: String,
    val noKill: Boolean,
    val bookCode: String,
    val expirationDate: String
)
