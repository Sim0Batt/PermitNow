package database.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId

@Serializable
class FishingPermitDocument (
    @Contextual val _id: ObjectId = ObjectId.get(),
    val userId: String = "",
    val licenseId: String = "",
    val zone: String = "",
    val type: String = "",
    val noKill: Boolean = false,
    val startDate: String = "",
    val endDate: String = "",
    val numberOfRods: Int = 1,
    val maxCatch: Int = 0,
    val price: Double = 0.0,
    val status: String = "ACTIVE",
    val qrCodeToken: String = ""
){
    override fun toString(): String {
        return """
{
    "id": "$_id",
    "userId": "$userId",
    "licenseId": "$licenseId",
    "zone": "$zone",
    "type": "$type",
    "noKill": $noKill,
    "startDate": "$startDate",
    "endDate": "$endDate",
    "numberOfRods": $numberOfRods,
    "maxCatch": $maxCatch,
    "price": $price,
    "status": "$status",
    "qrCodeToken": "$qrCodeToken"
}
        """.trimIndent()
    }
}
