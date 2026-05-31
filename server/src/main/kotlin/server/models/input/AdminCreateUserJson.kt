package server.models.input

import kotlinx.serialization.Serializable

@Serializable
class AdminCreateUserJson(
    val name: String,
    val surname: String,
    val email: String,
    val password: String,
    val fiscalCode: String
)
