package server

import configuration.ReadXMLResources
import database.DatabaseConfig
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import exceptions.UserException
import managers.UserManager
import server.models.input.ChangePasswordJson
import server.models.input.ProfileUpdateJson
import server.models.input.LoginJson
import server.models.input.RegisterJson
import server.models.output.LoginResponseJson



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


    // Routes
    routing {
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