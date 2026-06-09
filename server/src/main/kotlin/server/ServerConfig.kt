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
import managers.BooksManager
import managers.LicenseManager
import managers.PermitManager
import managers.UserManager
import server.models.input.AdminCreateFishingLicenseJson
import server.models.input.AdminCreateUserJson
import server.models.input.FishingPermitRequestJson
import server.models.input.UpdateFishingLicenseJson
import script.LicenseRecognition
import server.models.input.ChangePasswordJson
import server.models.input.FishingRowJson
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
    val permitManager = PermitManager(connection, permitNowConfiguration)
    val bookManager = BooksManager(connection, permitNowConfiguration)

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
        get("/license/list") {
            // TODO(auth): require admin role
            try {
                call.respond(HttpStatusCode.OK, licenseManager.listLicenses())
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
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
        post("/license/fishing/admin") {
            // TODO(auth): require admin role
            try {
                val data = call.receive<AdminCreateFishingLicenseJson>()
                licenseManager.createLicenseManually(data)
                call.respond(HttpStatusCode.Created, mapOf("message" to "License created successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        get("/license/fishing/{userId}") {
            // TODO(auth): require authenticated user matching userId or admin role
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@get
            }
            try {
                call.respond(HttpStatusCode.OK, licenseManager.getLicense(userId))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        put("/license/fishing/{userId}") {
            // TODO(auth): require admin role
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@put
            }
            try {
                val data = call.receive<UpdateFishingLicenseJson>()
                licenseManager.updateLicense(userId, data)
                call.respond(HttpStatusCode.OK, mapOf("message" to "License updated successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
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


        post("/page/{userId}"){
            try{
                val userId = call.parameters["userId"]
                if (userId == null) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                    return@post
                }
                bookManager.createNewPage(userId)
                call.respond(HttpStatusCode.OK)
            } catch (e: Exception){
                if(e.message!!.contains("Book already has a page for today")){
                    call.respond(HttpStatusCode.Conflict, mapOf("error" to e.message))
                }
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }

        post("/row/{pageId}"){
            val input = call.receive<FishingRowJson>()
            try{
                val pageId = call.parameters["pageId"]
                if (pageId == null) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing pageId parameter"))
                    return@post
                }
                bookManager.addRowToPage(pageId, input)
                call.respond(HttpStatusCode.OK)
            }catch (e: Exception){
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }

        get("/page/{bookId}"){
            try {
                val bookId = call.parameters["bookId"]
                call.respond(bookManager.getPagesForBook(bookId!!))
            }catch (e: Exception){
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }

        get("/row/{pageId}"){
            try {
                val pageId = call.parameters["pageId"]
                call.respond(bookManager.getRowsForPage(pageId!!))
            }catch (e: Exception){
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }

        delete("/page/{pageId}"){
            try{
                val pageId = call.parameters["pageId"]
                bookManager.deletePage(pageId!!)
                call.respond(HttpStatusCode.OK, mapOf("message" to "Page deleted successfully"))
            }catch (e: Exception){
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }

        delete("/row/{rowId}"){
            try{
                val rowId = call.parameters["rowId"]
                bookManager.deleteRow(rowId!!)
                call.respond(HttpStatusCode.OK, mapOf("message" to "Row deleted successfully"))
            }catch (e: Exception) {
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }




        // FISHING PERMIT
        get("/permit/list") {
            // TODO(auth): require admin role
            try {
                call.respond(HttpStatusCode.OK, permitManager.listPermits())
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post("/permit/fishing") {
            // TODO(auth): require authenticated user matching userId
            try {
                val data = call.receive<FishingPermitRequestJson>()
                permitManager.requestPermit(data)
                call.respond(HttpStatusCode.Created, mapOf("message" to "Permit created successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        post("/permit/fishing/admin") {
            // TODO(auth): require admin role
            try {
                val data = call.receive<FishingPermitRequestJson>()
                permitManager.createPermitAdmin(data)
                call.respond(HttpStatusCode.Created, mapOf("message" to "Permit created successfully"))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }
        get("/permit/fishing/{userId}") {
            // TODO(auth): require authenticated user matching userId or admin role
            val userId = call.parameters["userId"]
            if (userId == null) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing userId parameter"))
                return@get
            }
            try {
                call.respond(HttpStatusCode.OK, permitManager.getPermitsByUser(userId))
            } catch (e: UserException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.customMessage))
           } catch (e: Exception) {
               call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
           }
       }

        delete("/permit/fishing/{permitId}") {
            try {
                permitManager.deletePermit(call.parameters["permitId"]!!)
                call.respond(HttpStatusCode.OK, mapOf("message" to "Permit deleted successfully"))
            }catch (e: Exception){
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
            }
        }

        delete("/permit/clear"){
            try {
                permitManager.clear()
                call.respond(HttpStatusCode.OK, mapOf("message" to "Expired permits cleared successfully"))
            }catch (e: Exception){
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Internal server error"))
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