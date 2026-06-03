package database.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId
import java.time.LocalDate

@Serializable
class FishingBookRowDocument (
    @Contextual val _id: ObjectId = ObjectId.get(),
    val pageId: String,
    val fishName: String,
    val zone: String,
    val specie: String,
    val measure: Double
){
    override fun toString(): String {
        return """
{
    "_id" : $_id,
    "pageId" : "$pageId,
    "fishName" : "$fishName,
    "zone" : "$zone,
    "specie" : "$specie,
    "measure" : $measure
}
        """.trimIndent()
    }
}