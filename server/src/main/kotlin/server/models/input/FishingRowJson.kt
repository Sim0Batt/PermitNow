package server.models.input

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId
import java.time.LocalDate

@Serializable
class FishingRowJson (
    val id: String,
    val pageId: String,
    val fishName: String,
    val date: String,
    val zone: String,
    val specie: String,
    val measure: Double
){
    override fun toString(): String {
        return """
{
    "id": "$id",
    "pageId" : "$pageId,
    "fishName" : "$fishName,
    "date" : "$date,
    "zone" : "$zone,
    "specie" : "$specie,
    "measure" : $measure
}
        """.trimIndent()
    }
}