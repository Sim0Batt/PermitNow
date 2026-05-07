package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class RegisterJson (
    val name: String,
    val surname: String,
    val email: String,
    val password: String,
    val fiscalCode: String = "",
    val role: String = "user",
    val verified: Boolean = false
){
    override fun toString(): String {
        return """
{
    "name": "$name",
    "surname": "$surname",
    "email": "$email",
    "password": "$password",
    "fiscalCode": "$fiscalCode",
    "role": "$role",
    "verified": $verified
}
        """.trimIndent()
    }
}