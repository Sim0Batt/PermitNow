package database.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId

@Serializable
class UserDocument (
    @Contextual val _id: ObjectId = ObjectId.get(),
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
    "id": "$_id",
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