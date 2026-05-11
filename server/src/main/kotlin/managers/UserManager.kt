package managers

import database.DatabaseConfig
import database.documents.UserDocument
import exceptions.UserException
import org.bson.types.ObjectId
import org.litote.kmongo.eq
import org.litote.kmongo.setValue
import server.models.input.LoginJson
import server.models.input.RegisterJson
import server.models.output.LoginResponseJson

class UserManager (val connection: DatabaseConfig){

    val usersCollection = connection.userCollection

    suspend fun register(registerJson: RegisterJson): String{
        try {
            val user = UserDocument(
                name = registerJson.name,
                surname = registerJson.surname,
                email = registerJson.email,
                password = registerJson.password,
                fiscalCode = registerJson.fiscalCode,
                role = registerJson.role,
                verified = registerJson.verified
            )

            usersCollection.insertOne(user)

            return user._id.toHexString()
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun login(loginJson: LoginJson): LoginResponseJson {
        // TODO(constraints): validate email format and password presence
        val user = usersCollection.findOne(UserDocument::email eq loginJson.email)
            ?: throw UserException("User not found")

        // TODO(auth): verify hashed password and issue JWT
        return LoginResponseJson(
            userId = user._id.toHexString(),
            email = user.email,
            role = user.role
        )
    }

    suspend fun changePassword(userId: String, currentPassword: String, newPassword: String) {
        if (newPassword.isBlank()) throw UserException("New password cannot be empty")
        if (currentPassword.isBlank()) throw UserException("Current password cannot be empty")

        val user = usersCollection.findOne(UserDocument::_id eq ObjectId(userId))
            ?: throw UserException("User not found")

        if (user.password != currentPassword) throw UserException("Current password is incorrect")

        usersCollection.updateOne(UserDocument::_id eq ObjectId(userId), setValue(UserDocument::password, newPassword))
    }
}