package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class LoginJson(
    val email: String,
    val password: String
) {
    override fun toString(): String {
        return """
{
    "email": "$email",
    "password": "$password"
}
        """.trimIndent()
    }
}
