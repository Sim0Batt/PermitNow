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
import managers.UserManager
import server.models.input.RegisterJson



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
    val userManager = UserManager(connection)


    // Routes
    routing {
        post ("/register") {
            val registerJson = call.receive<RegisterJson>()
            try {
                val userId = userManager.register(registerJson)
                call.respond(userId)
            } catch (e: Exception) {
                call.respond( "FA")
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