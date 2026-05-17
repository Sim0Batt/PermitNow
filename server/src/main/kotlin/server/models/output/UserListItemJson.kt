package server.models.output

import kotlinx.serialization.Serializable

@Serializable
class UserListItemJson(
    val id: String,
    val name: String,
    val surname: String,
    val email: String,
    val role: String,
    val verified: Boolean,
    val deleted: Boolean
)
