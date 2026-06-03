package server

import configuration.ReadXMLResources
import database.DatabaseConfig
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.request.receive
import io.ktor.server.request.receiveMultipart
import io.ktor.server.response.respond
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import java.io.File
import exceptions.UserException
import managers.LicenseManager
import managers.UserManager
import server.models.input.AdminCreateUserJson
import script.LicenseRecognition
import server.models.input.ChangePasswordJson
import server.models.input.ProfileUpdateJson
import server.models.input.LoginJson
import server.models.input.RegisterJson
import server.models.output.LoginResponseJson
import utils.imagePath
import java.sql.SQLSyntaxErrorException


val permitNowConfiguration = ReadXMLResources.getConfiguration()

fun Application.module() {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            allowSpecialFloatingPointValues = true
            allowTrailingComma = true
        })
    }
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)

        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)

        anyHost() // TODO: da togliere in produzione
    }

    // MongoDB connection
    val connection = DatabaseConfig(
        permitNowConfiguration.database!!.connectionUrl,
        permitNowConfiguration.database!!.dbName
    )


    // Managers
    val userManager = UserManager(connection, permitNowConfiguration)
    val licenseRecognition = LicenseRecognition(permitNowConfiguration, userManager)
    val licenseManager = LicenseManager(connection, permitNowConfiguration, licenseRecognition)

    // Routes
    routing {
        // STATUS ROUTES
        get("/status"){
            call.respond(HttpStatusCode.OK, "OK")
        }

//        get("/status/permit"){
//            try{
//                val count = fishingPermitManager.getValidPermits().size
//                call.respond(HttpStatusCode.OK, "")
//            }catch (e: Exception){
//                call.respond(HttpStatusCode.InternalServerError, "FA")
//            }catch(sqe: SQLSyntaxErrorException){
//                call.respond(HttpStatusCode.InternalServerError, "FA")
//            }
//        }

        get("/status/license"){
            try{
                call.respond(HttpStatusCode.OK, licenseManager.listLicenses().count())
            }catch (e: Exception){
                call.respond(HttpStatusCode.InternalServerError, "FA")
            }catch(sqe: SQLSyntaxErrorException){
                call.respond(HttpStatusCode.InternalServerError, "FA")
            }
        }

//        get("/status/news"){
//            try{
//                val count = newsManager.getAllNews().size
//                call.respond(HttpStatusCode.OK, "")
//            }catch (e: Exception){
//                call.respond(HttpStatusCode.InternalServerError, "FA")
//            }catch(sqe: SQLSyntaxErrorException){
//                call.respond(HttpStatusCode.InternalServerError, "FA")
//            }
//        }

        get("/status/user"){
            try{
                call.respond(HttpStatusCode.OK, userManager.listUsers().size)
            }catch (e: Exception){
                call.respond(HttpStatusCode.InternalServerError, "FA")
            }catch(sqe: SQLSyntaxErrorException){
                call.respond(HttpStatusCode.InternalServerError, "FA")
            }
        }





        post("/login") {
            val loginJson = call.receive<LoginJson>()
            try {
                val response = userManager.login(loginJson)
                call.respond(HttpStatusCode.OK, response)
            } catch (e: UserException) {
                // TODO(auth): distinguish "user not found" from "wrong password" once auth layer is added
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post ("/login/admin") {
            val loginJson = call.receive<LoginJson>()
            try {
                val response = userManager.adminLogin(loginJson)
                call.respond(HttpStatusCode.OK, response)
            } catch (e: UserException) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post ("/register") {
            val registerJson = call.receive<RegisterJson>()
            try {
                val userId = userManager.register(registerJson)
                call.respond(userId)
            } catch (e: Exception) {
                call.respond( "FA")
            }
        }
        // Backend has no session/JWT to invalidate; this endpoint confirms the action and is a placeholder for future audit logging.
        post ("/logout") {
            try {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Logout successful"))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post ("/user/{userId}/change-password") {
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@post
            }
            try {
                val data = call.receive<ChangePasswordJson>()
                userManager.changePassword(userId, data.currentPassword, data.newPassword)
                call.respond(HttpStatusCode.OK, mapOf("message" to "Password updated successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post ("/user/{userId}/profile") {
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@post
            }
            try {
                val data = call.receive<ProfileUpdateJson>()
                userManager.updateProfile(userId, data)
                call.respond(HttpStatusCode.OK, mapOf("message" to "Profile updated successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        delete("/user/{userId}") {
            // TODO(auth): require admin role before allowing deletion
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@delete
            }
            try {
                userManager.deleteUser(userId)
                call.respond(HttpStatusCode.OK, mapOf("message" to "User deleted successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post("/user/{userId}/verify") {
            // TODO(auth): require admin role before allowing verification toggle
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@post
            }
            try {
                userManager.verifyUser(userId)
                call.respond(HttpStatusCode.OK, mapOf("message" to "User verification toggled successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post("/admin/users") {
            val json = call.receive<AdminCreateUserJson>()
            try {
                val userId = userManager.createUser(json)
                call.respond(HttpStatusCode.Created, mapOf("id" to userId))
            } catch (e: UserException) {
                if (e.customMessage.startsWith("DUPLICATE:")) {
                    call.respond(HttpStatusCode.Conflict, mapOf("error" to e.customMessage.removePrefix("DUPLICATE:")))
                } else {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        get("/user/list") {
            // TODO(auth): require admin role
            // TODO(scope): paginate when the list grows
            try {
                call.respond(HttpStatusCode.OK, userManager.listUsers())
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }




        // FISHING LICENSE
        post("/license/fishing"){
            val multipart = call.receiveMultipart()
            var userId: String? = null
            var imageFile: File? = null

            multipart.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        if (part.name == "userId") {
                            userId = part.value
                        }
                    }

                    is PartData.FileItem -> {
                        val fileName = "${userId}_FISHING.jpg"
                        val uploadDir = File(imagePath)
                        if (!uploadDir.exists()) {
                            uploadDir.mkdirs()
                        }
                        imageFile = File(uploadDir, fileName)
                        part.streamProvider().use { input ->
                            imageFile.outputStream().buffered().use { output ->
                                input.copyTo(output)
                            }
                        }
                    }

                    else -> {}
                }
                part.dispose()
            }

            if (userId == null || imageFile == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId or image file"))
                return@post
            }

            try {
                val userDocument = userManager.getUserInfo(userId)
                val imageFile = File(imagePath + "${userDocument._id}_FISHING.jpg")
                val fishingDocument = licenseRecognition.readFishingLicense(userDocument, imageFile)
                licenseManager.addLicense(userId, fishingDocument)
                call.respond(HttpStatusCode.OK, "License added successfully")
            }catch (e: Exception){
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }

        }
        delete("/license/fishing/{userId}") {
            // TODO(auth): require authenticated user matching userId
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@delete
            }
            try {
                licenseManager.deleteLicense(userId)
                call.respond(HttpStatusCode.OK, mapOf("message" to "License deleted successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }


        get("license/{userId}"){
            try {
                val userId = call.parameters["userId"].toString()
                val licenseInfo = licenseManager.getLicenseInfo(userId)
                call.respond(HttpStatusCode.OK, licenseInfo)
            }catch (e: Exception){
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.toString()))
            }
        }
    }
}

object ServerConfig {
    fun run() {
        embeddedServer(
            Netty,
            port = permitNowConfiguration.serverConfiguration!!.port.toInt(),
            host = permitNowConfiguration.serverConfiguration!!.host,
            module = Application::module
        ).start(wait = true)
    }
}