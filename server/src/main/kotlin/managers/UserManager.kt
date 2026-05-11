package managers

import database.DatabaseConfig
import database.documents.UserDocument
import exceptions.UserException
import org.bson.types.ObjectId
import org.litote.kmongo.combine
import org.litote.kmongo.eq
import org.litote.kmongo.setValue
import server.models.input.ProfileUpdateJson
import server.models.input.LoginJson
import server.models.input.RegisterJson
import server.models.output.LoginResponseJson
import configuration.PermitNowConfiguration
import org.bouncycastle.crypto.generators.Argon2BytesGenerator
import org.bouncycastle.crypto.params.Argon2Parameters
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

class UserManager (val connection: DatabaseConfig){

    val usersCollection = connection.userCollection

    suspend fun register(registerJson: RegisterJson): String {
        try {
            // TODO(constraints): check for duplicate fiscalCode before inserting
            val hashedPassword = hashPassword(registerJson.password)
            val encryptedFiscalCode = encryptFiscalCode(registerJson.fiscalCode, PermitNowConfiguration.aesKey)

            val user = UserDocument(
                name = registerJson.name,
                surname = registerJson.surname,
                email = registerJson.email,
                password = hashedPassword,
                fiscalCode = encryptedFiscalCode,
                role = registerJson.role,
                verified = registerJson.verified
            )

            usersCollection.insertOne(user)

            return user._id.toHexString()
        } catch (e: Exception) {
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
            userId = user._id.toHexString()
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

    suspend fun updateProfile(userId: String, profileData: ProfileUpdateJson) {
        if (profileData.name.isBlank()) throw UserException("Name cannot be empty")
        if (profileData.surname.isBlank()) throw UserException("Surname cannot be empty")
        if (profileData.email.isBlank()) throw UserException("Email cannot be empty")

        usersCollection.findOne(UserDocument::_id eq ObjectId(userId))
            ?: throw UserException("User not found")

        usersCollection.updateOne(
            UserDocument::_id eq ObjectId(userId),
            combine(
                setValue(UserDocument::name, profileData.name),
                setValue(UserDocument::surname, profileData.surname),
                setValue(UserDocument::email, profileData.email),
                setValue(UserDocument::fiscalCode, profileData.fiscalCode)
            )
        )
    }

    private fun hashPassword(password: String): String {
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        val params = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withVersion(Argon2Parameters.ARGON2_VERSION_13)
            .withSalt(salt)
            .withParallelism(1)
            .withMemoryAsKB(65536)
            .withIterations(3)
            .build()
        val gen = Argon2BytesGenerator()
        gen.init(params)
        val hash = ByteArray(32)
        gen.generateBytes(password.toCharArray(), hash)
        val b64 = Base64.getEncoder().withoutPadding()
        return "\$argon2id\$v=19\$m=65536,t=3,p=1\$${b64.encodeToString(salt)}\$${b64.encodeToString(hash)}"
    }

    private fun encryptFiscalCode(fiscalCode: String, aesKeyBase64: String): String {
        val key = SecretKeySpec(Base64.getDecoder().decode(aesKeyBase64), "AES")
        val iv = ByteArray(12).also { SecureRandom().nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(128, iv))
        val ciphertext = cipher.doFinal(fiscalCode.toByteArray(Charsets.UTF_8))
        val b64 = Base64.getEncoder()
        return "${b64.encodeToString(iv)}:${b64.encodeToString(ciphertext)}"
    }
}