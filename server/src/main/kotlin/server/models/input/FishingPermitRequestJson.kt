package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class FishingPermitRequestJson(
    val userId: String,
    val zone: String,
    val type: String,
    val noKill: Boolean,
    val startDate: String,
    val numberOfRods: Int,
    val maxCatch: Int
)
