package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class LoginResponseJson(
    val userId: String,
    val email: String,
    val role: String
) {
    override fun toString(): String {
        return """
{
    "userId": "$userId",
    "email": "$email",
    "role": "$role"
}
        """.trimIndent()
    }
}
