package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class ProfileUpdateJson (
    val name: String,
    val surname: String,
    val email: String,
    val fiscalCode: String = ""
){
    override fun toString(): String {
        return """
{
    "name": "$name",
    "surname": "$surname",
    "email": "$email",
    "fiscalCode": "$fiscalCode"
}
        """.trimIndent()
    }
}
