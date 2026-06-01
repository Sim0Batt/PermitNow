package database.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId

@Serializable
class FishingPageDocument(
    @Contextual val _id: ObjectId = ObjectId.get(),
    val bookId: String,
) {
    override fun toString(): String {
        return """
{
"_id": "$_id",
"bookId": "$bookId"
}
        """.trimIndent()
    }
}