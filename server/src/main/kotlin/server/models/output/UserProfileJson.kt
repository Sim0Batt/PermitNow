package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class UserProfileJson(
    val userId: String,
    val name: String,
    val surname: String,
    val email: String,
    val role: String,
    val verified: Boolean
)
