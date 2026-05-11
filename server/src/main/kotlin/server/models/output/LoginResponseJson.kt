package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class LoginResponseJson(
    val userId: String
) {
    override fun toString(): String {
        return """
{
    "userId": "$userId"
}
        """.trimIndent()
    }
}
