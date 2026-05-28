package script

import ai.koog.prompt.dsl.prompt
import ai.koog.prompt.executor.clients.google.GoogleModels
import ai.koog.prompt.executor.llms.all.simpleGoogleAIExecutor
import ai.koog.prompt.message.AttachmentContent
import ai.koog.prompt.message.ContentPart
import ai.koog.prompt.params.LLMParams
import configuration.PermitNowConfiguration
import database.documents.FishingLicenseDocument
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.JsonArray
import utils.FISHING_SYSTEM_PROMPT
import utils.imagePath
import utils.models.FishingStructuredOutput
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import javax.imageio.ImageIO

class LicenseRecognition(val permitNowConfiguration: PermitNowConfiguration) {

    val executor = simpleGoogleAIExecutor(permitNowConfiguration.googleApiKey)

    suspend fun readFishingLicense(userId: String): FishingLicenseDocument {

        val imageFile = File(imagePath + "${userId}_FISHING.jpg")

        val compressedBytes = imageCompression(imageFile.readBytes())

        val multimodalPrompt = prompt(
            id = "fishing-ocr",
            params = LLMParams(
                temperature = 0.0,
                schema = LLMParams.Schema.JSON.Basic(
                    name = "FishingOutput",
                    // Costruiamo lo Schema Formale
                    schema = JsonObject(mapOf(
                        "type" to JsonPrimitive("object"),
                        "properties" to JsonObject(mapOf(
                            "licenseNumber" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                            "releasedBy" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                            "season" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                            "noKill" to JsonObject(mapOf("type" to JsonPrimitive("boolean"))),
                            "fiscalCode" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                            "bookCode" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                            "expirationDate" to JsonObject(mapOf("type" to JsonPrimitive("string")))
                        )),
                        "required" to JsonArray(listOf(
                            JsonPrimitive("licenseNumber"),
                            JsonPrimitive("releasedBy"),
                            JsonPrimitive("season"),
                            JsonPrimitive("noKill"),
                            JsonPrimitive("fiscalCode"),
                            JsonPrimitive("bookCode"),
                            JsonPrimitive("expirationDate")
                        ))
                    ))
                )
            )
        ) {
            system(FISHING_SYSTEM_PROMPT)
            user {
                +"Estrai i dati da questa licenza di pesca. Segui lo schema alla lettera."
                image(ContentPart.Image(content = AttachmentContent.Binary.Bytes(compressedBytes), format = "jpg"))
            }
        }

        val response = executor.execute(
            prompt = multimodalPrompt,
            model = GoogleModels.Gemini2_5Flash
        )

        return try {
            val responseText = response.firstOrNull()?.content ?: ""

            val finalJson = Json.decodeFromString<FishingStructuredOutput>(responseText.removePrefix("```json").removeSuffix("```").trim())

            FishingLicenseDocument(
                qrCodeToken = "",
                status = "PENDING",
                licenseNumber = finalJson.licenseNumber,
                releasedBy = finalJson.releasedBy,
                season = finalJson.season,
                noKill = finalJson.noKill,
                bookCode = finalJson.bookCode,
                expirationDate = finalJson.expirationDate
            )
        } catch (e: Exception) {
            e.printStackTrace()
            FishingLicenseDocument()
        }
    }

    fun imageCompression(imageBytes: ByteArray): ByteArray{
            val original = ImageIO.read(ByteArrayInputStream(imageBytes)) ?: return imageBytes

            val maxWidth = 1000
            if (original.width <= maxWidth) return imageBytes

            val ratio = maxWidth.toDouble() / original.width
            val newHeight = (original.height * ratio).toInt()

            // 4. Ridisegniamo l'immagine rimpicciolita
            val resized = BufferedImage(maxWidth, newHeight, BufferedImage.TYPE_INT_RGB)
            val g = resized.createGraphics()
            g.drawImage(original, 0, 0, maxWidth, newHeight, null)
            g.dispose()

            val baos = ByteArrayOutputStream()
            ImageIO.write(resized, "jpg", baos)
            return baos.toByteArray()
    }
}