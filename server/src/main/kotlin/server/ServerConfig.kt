package server

import configuration.ReadXMLResources
import exceptions.DecryptionException
import exceptions.LoginException
import exceptions.RegistrationException
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import kotlinx.io.readByteArray
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.Database
import script.*
import server.dto.common.CountResponse
import server.dto.common.StatusResponse
import server.dto.request.LoginRequest
import server.dto.request.NewHuntingLicenseRequest
import server.dto.request.NewPermitRequest
import server.dto.request.RegisterRequest
import server.dto.response.FishingPermitResponse
import utils.licensesPath
import java.io.File
import java.sql.SQLSyntaxErrorException
import kotlin.collections.count
import kotlin.collections.set
import kotlin.io.writeBytes
import kotlin.let
import kotlin.stackTraceToString
import kotlin.text.toInt



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

    routing {

    }
}

object ServerConfig {
    fun run() {
        embeddedServer(
            Netty,
            port = 8080,
            host = "127.0.0.1",
            module = Application::module
        ).start(wait = true)
    }
}