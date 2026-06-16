package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class UpdateFishingLicenseJson(
    val licenseNumber: String,
    val releasedBy: String,
    val season: String,
    val status: String,
    val noKill: Boolean,
    val bookCode: String,
    val expirationDate: String
)
