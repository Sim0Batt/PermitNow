package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class FishingPageInfoJson(
    val id: String,
    val bookId: String,
    val date: String,
) {
    override fun toString(): String {
        return """
{
    "id": "$id",
    "bookId": "$bookId",
    "date": "$date"
}
        """.trimIndent()
    }
}
