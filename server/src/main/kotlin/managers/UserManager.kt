package managers

import database.DatabaseConfig
import database.documents.UserDocument
import exceptions.UserException
import server.models.input.RegisterJson

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
}