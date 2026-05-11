package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class ChangePasswordJson (
    val currentPassword: String,
    val newPassword: String
){
    override fun toString(): String {
        return """
{
    "currentPassword": "$currentPassword",
    "newPassword": "$newPassword"
}
        """.trimIndent()
    }
}
