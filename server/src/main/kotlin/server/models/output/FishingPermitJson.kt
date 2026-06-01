package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class FishingPermitJson(
    val permitId: String,
    val userId: String,
    val licenseId: String,
    val zone: String,
    val type: String,
    val noKill: Boolean,
    val startDate: String,
    val endDate: String,
    val numberOfRods: Int,
    val maxCatch: Int,
    val price: Double,
    val status: String,
    val qrCodeToken: String
)
