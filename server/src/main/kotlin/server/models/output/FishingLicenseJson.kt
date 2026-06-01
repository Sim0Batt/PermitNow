package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class FishingLicenseJson(
    val qrCodeToken: String,
    val status: String,
    val licenseNumber: String,
    val releasedBy: String,
    val season: String,
    val noKill: Boolean,
    val bookCode: String,
    val expirationDate: String
)
