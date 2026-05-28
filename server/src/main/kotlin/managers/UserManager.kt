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
import server.models.output.UserListItemJson
import configuration.PermitNowConfiguration
import exceptions.EncryptionException
import org.bouncycastle.crypto.generators.Argon2BytesGenerator
import org.bouncycastle.crypto.params.Argon2Parameters
import org.litote.kmongo.and
import java.security.SecureRandom
import java.util.Base64
import java.util.logging.Logger
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

class UserManager (val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration){

    val usersCollection = connection.userCollection
    val logger = Logger.getLogger(this::class.java.name)

    suspend fun register(registerJson: RegisterJson): String {
        try {
            if(!isValidRegistration(registerJson)) throw UserException("Invalid registration data")
            if(usersCollection.countDocuments(UserDocument::email eq registerJson.email) > 0) {
                logger.warning("User already exists with this email")
                throw UserException("User already exists with this email")
            }

            // TODO(constraints): fiscalCode duplicate check requires a dedicated
            // searchable hash field — cannot compare AES-GCM ciphertexts directly

            logger.info("Creating new user: ${registerJson.name} ${registerJson.surname}")
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

            val user = usersCollection.findOne(
                and(UserDocument::email eq loginJson.email, UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            if (!verifyPassword(loginJson.password, user.password)) throw UserException("Wrong password")

            return user._id.toHexString()
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun adminLogin(loginJson: LoginJson): String {
        try {
            if (!isValidLogin(loginJson)) throw UserException("Invalid login data")

            val user = usersCollection.findOne(
                and(UserDocument::email eq loginJson.email, UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            if (!verifyPassword(loginJson.password, user.password)) throw UserException("Wrong password")

            if (user.role != "admin") throw UserException("Access denied: user is not an admin")

            return user._id.toHexString()
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun changePassword(userId: String, currentPassword: String, newPassword: String) {
        try{
            if (newPassword.isBlank()) throw UserException("New password cannot be empty")
            if (currentPassword.isBlank()) throw UserException("Current password cannot be empty")
            if (newPassword.length < 8) throw UserException("New password must be at least 8 characters")
            if (newPassword == currentPassword) throw UserException("New password must differ from current password")

            val user = usersCollection.findOne(
                and(UserDocument::_id eq ObjectId(userId), UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            if (!verifyPassword(currentPassword, user.password)) throw UserException("Current password is incorrect")

            usersCollection.updateOne(
                UserDocument::_id eq ObjectId(userId),
                setValue(UserDocument::password, hashPassword(newPassword))
            )
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun updateProfile(userId: String, profileData: ProfileUpdateJson) {
        try{
            val user = usersCollection.findOne(
                and(UserDocument::_id eq ObjectId(userId), UserDocument::deleted eq false)
            ) ?: throw UserException("User not found")

            if (profileData.email.isBlank()) throw UserException("Email cannot be empty")
            val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
            if (!emailRegex.matches(profileData.email)) throw UserException("Invalid email format")

            if (!user.verified) {
                if (profileData.name.isBlank()) throw UserException("Name cannot be empty")
                if (profileData.surname.isBlank()) throw UserException("Surname cannot be empty")
                val fiscalCodeRegex = Regex("^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$")
                if (!fiscalCodeRegex.matches(profileData.fiscalCode)) throw UserException("Invalid fiscal code format")

                usersCollection.updateOne(
                    UserDocument::_id eq ObjectId(userId),
                    combine(
                        setValue(UserDocument::name, profileData.name),
                        setValue(UserDocument::surname, profileData.surname),
                        setValue(UserDocument::email, profileData.email),
                        setValue(UserDocument::fiscalCode, encryptFiscalCode(profileData.fiscalCode, permitNowConfiguration.aesKey))
                    )
                )
            } else {
                // TODO(auth-spid): enforce verified field via SPID assertion, not client input
                if (profileData.name != user.name ||
                    profileData.surname != user.surname ||
                    profileData.fiscalCode != decryptFiscalCode(user.fiscalCode)
                ) throw UserException("Field cannot be modified after SPID verification")

                usersCollection.updateOne(
                    UserDocument::_id eq ObjectId(userId),
                    setValue(UserDocument::email, profileData.email)
                )
            }
        }catch (e: Exception){
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }





    suspend fun deleteUser(userId: String) {
        try {
            val user = usersCollection.findOne(UserDocument::_id eq ObjectId(userId))
                ?: throw UserException("User not found")
            if (user.deleted) throw UserException("User already deleted")

            usersCollection.updateOne(
                UserDocument::_id eq ObjectId(userId),
                setValue(UserDocument::deleted, true)
            )
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun verifyUser(userId: String) {
        try {
            val user = usersCollection.findOne(UserDocument::_id eq ObjectId(userId))
                ?: throw UserException("User not found")
            if (user.deleted) throw UserException("Cannot verify a deleted user")

            usersCollection.updateOne(
                UserDocument::_id eq ObjectId(userId),
                setValue(UserDocument::verified, !user.verified)
            )
        } catch (e: Exception) {
            e.printStackTrace()
            throw UserException(e.message.toString())
        }
    }

    suspend fun listUsers(): List<UserListItemJson> {
        try {
            return usersCollection.find().toList().map {
                UserListItemJson(
                    id = it._id.toHexString(),
                    name = it.name,
                    surname = it.surname,
                    email = it.email,
                    role = it.role,
                    verified = it.verified,
                    deleted = it.deleted
                )
            }
        } catch (e: Exception) {
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

    fun encryptFiscalCode(fiscalCode: String, aesKeyBase64: String): String {
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

        if (parts.size != 5) return false

        val storedSalt = try { Base64.getDecoder().decode(parts[3]) } catch (e: Exception) { return false }
        val expectedHash = try { Base64.getDecoder().decode(parts[4]) } catch (e: Exception) { return false }

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

        return java.security.MessageDigest.isEqual(hash, expectedHash)
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