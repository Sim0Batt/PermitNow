package server.models.output

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId

@Serializable
class FishingRowInfoJson(
    val id: String,
    val pageId: String,
    val fishName: String,
    val zone: String,
    val specie: String,
    val measure: Double
) {
    override fun toString(): String {
        return """
{
    "id": "$id",
    "pageId" : "$pageId,
    "fishName" : "$fishName,
    "zone" : "$zone,
    "specie" : "$specie,
    "measure" : $measure
}
        """.trimIndent()
    }
}