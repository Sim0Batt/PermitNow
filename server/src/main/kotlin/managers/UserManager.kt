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
import exceptions.EncryptionException
import org.bouncycastle.crypto.generators.Argon2BytesGenerator
import org.bouncycastle.crypto.params.Argon2Parameters
import org.litote.kmongo.and
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

class UserManager (val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration){

    val usersCollection = connection.userCollection

    suspend fun register(registerJson: RegisterJson): String {
        try {
            if(!isValidRegistration(registerJson)) throw UserException("Invalid registration data")
            if(usersCollection.countDocuments(UserDocument::email eq registerJson.email) > 0) {
                throw UserException("User already exists with this email")
            }
            if(usersCollection.countDocuments(UserDocument::fiscalCode eq decryptFiscalCode(registerJson.fiscalCode)) > 0) {
                throw UserException("User already exists with this fiscal code")
            }

            val user = UserDocument(
                name = registerJson.name,
                surname = registerJson.surname,
                email = registerJson.email,
                password = hashPassword(registerJson.password),
                fiscalCode = encryptFiscalCode(registerJson.fiscalCode, permitNowConfiguration.aesKey),
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

    suspend fun login(loginJson: LoginJson): String {
        try{
            if (!isValidLogin(loginJson)) throw UserException("Invalid login data")

            println("Login attempt: ${loginJson.email} ${loginJson.password}")
            val user = usersCollection.findOne(UserDocument::email eq loginJson.email)
                ?: throw UserException("User not found")

            if (!verifyPassword(loginJson.password, user.password)) throw UserException("Wrong password")

            return user._id.toHexString()
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun changePassword(userId: String, currentPassword: String, newPassword: String) {
        try{
            if (newPassword.isBlank()) throw UserException("New password cannot be empty")
            if (currentPassword.isBlank()) throw UserException("Current password cannot be empty")

            val user = usersCollection.findOne(UserDocument::_id eq ObjectId(userId))
                ?: throw UserException("User not found")

            if (verifyPassword(currentPassword, user.password)) throw UserException("Current password is incorrect")

            usersCollection.updateOne(
                UserDocument::_id eq ObjectId(userId),
                setValue(UserDocument::password, newPassword)
            )
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun updateProfile(userId: String, profileData: ProfileUpdateJson) {
        try{
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
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }





    // UTILS FUNCTIONS
    fun hashPassword(password: String): String {
        try{
            val localSalt = ByteArray(16).also { SecureRandom().nextBytes(it) }
            val hashParams = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withSalt(localSalt)
                .withParallelism(1)
                .withMemoryAsKB(65536)
                .withIterations(3)
                .build()

            val gen = Argon2BytesGenerator()
            gen.init(hashParams)
            val hash = ByteArray(32)
            gen.generateBytes(password.toCharArray(), hash)

            val b64 = Base64.getEncoder().withoutPadding()
            return "\$argon2id\$v=19\$m=65536,t=3,p=1\$${b64.encodeToString(localSalt)}\$${b64.encodeToString(hash)}"
        }catch (e: Exception){
            e.printStackTrace()
            throw EncryptionException("Error hashing password: ${e.message}")
        }
    }

    private fun encryptFiscalCode(fiscalCode: String, aesKeyBase64: String): String {
        try{
            val key = SecretKeySpec(Base64.getDecoder().decode(aesKeyBase64), "AES")
            val iv = ByteArray(12).also { SecureRandom().nextBytes(it) }
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(128, iv))
            val ciphertext = cipher.doFinal(fiscalCode.toByteArray(Charsets.UTF_8))
            val b64 = Base64.getEncoder()
            return "${b64.encodeToString(iv)}:${b64.encodeToString(ciphertext)}"
        }catch (e: Exception){
            e.printStackTrace()
            throw EncryptionException("Error encrypting fiscal code: ${e.message}")
        }
    }

    private fun verifyPassword(password: String, dbPassword: String): Boolean {
        val parts = dbPassword.split("$").filter { it.isNotEmpty() }

        val storedSalt = Base64.getDecoder().decode(parts[3])
        val expectedHash = Base64.getDecoder().decode(parts[4])

        val verifyParams = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withVersion(Argon2Parameters.ARGON2_VERSION_13)
            .withSalt(storedSalt)
            .withParallelism(1)
            .withMemoryAsKB(65536)
            .withIterations(3)
            .build()

        val gen = Argon2BytesGenerator()
        gen.init(verifyParams)
        val hash = ByteArray(32)
        gen.generateBytes(password.toCharArray(), hash)

        return hash.contentEquals(expectedHash)
    }

    fun decryptFiscalCode(encryptedFiscalCode: String): String {
        val parts = encryptedFiscalCode.split(":")
        val iv = Base64.getDecoder().decode(parts[0])
        val ciphertext = Base64.getDecoder().decode(parts[1])

        val key = SecretKeySpec(Base64.getDecoder().decode(permitNowConfiguration.aesKey), "AES")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))

        return String(cipher.doFinal(ciphertext), Charsets.UTF_8)
    }

    private fun isValidRegistration(registerJson: RegisterJson): Boolean {
        return registerJson.name.isNotBlank() &&
                registerJson.surname.isNotBlank() &&
                registerJson.email.isNotBlank() &&
                registerJson.password.isNotBlank() &&
                registerJson.role.isNotBlank() &&
                registerJson.fiscalCode.isNotBlank()
    }

    private fun isValidLogin(loginJson: LoginJson): Boolean {
        return loginJson.email.isNotBlank() && loginJson.password.isNotBlank()
    }

}