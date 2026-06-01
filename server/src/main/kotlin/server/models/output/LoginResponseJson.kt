package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class LoginResponseJson(
    val userId: String,
    val verified: Boolean
) {
    override fun toString(): String {
        return """
{
    "userId": "$userId",
    "verified": $verified
}
        """.trimIndent()
    }
}
