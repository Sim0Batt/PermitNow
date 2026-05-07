package configuration

import org.simpleframework.xml.Element

object PermitNowConfiguration {
    @field:Element(name = "Database", required = false)
    var database: DatabaseConfiguration? = null

    @field:Element(name = "Debug", required = false)
    var debug: Boolean = true

    @field:Element(name = "Server", required = false)
    var serverConfiguration: ServerConfiguration? = null

    @field:Element(name = "GoogleApiKey", required = false)
    var googleApiKey: String = ""
}