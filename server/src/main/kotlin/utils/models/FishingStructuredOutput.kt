package utils.models

import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
@SerialName("OutputStrutturato")
@LLMDescription("Output strutturato contenente i dati della licenza di pesca.")
class FishingStructuredOutput(
    @property:LLMDescription("Numero di licenza fisso")
    val licenseNumber: String,

    @property:LLMDescription("Associazione rilasciante la licenza")
    val releasedBy: String,

    @property:LLMDescription("Stagione in cui è valida la licenza")
    val season: String,

    @property:LLMDescription("Parametro booleano che indica se la licenza consente l'uccisione di pesci")
    val noKill: Boolean,

    @property:LLMDescription("Codice fiscale del pescatore")
    val fiscalCode: String,

    @property:LLMDescription("Codice del libretto di segna catture")
    val bookCode: String,

    @property:LLMDescription("Data di scadenza della licenza")
    val expirationDate: String
) {
    override fun toString(): String {
        return """
{
    "licenseNumber": "${licenseNumber.replace("\"", "'").trim()}",
    "releasedBy": "${releasedBy.replace("\"", "'").trim()}",
    "season": "${season.replace("\"", "'").trim()}",
    "noKill": $noKill,
    "fiscalCode": "${fiscalCode.replace("\"", "'").trim()}",
    "bookCode": "${bookCode.replace("\"", "'").trim()}",
    "expirationDate": "${expirationDate.replace("\"", "'").trim()}"
}
        """.trimIndent()
    }
}