package configuration

import org.simpleframework.xml.core.Persister
import utils.xmlPath
import java.io.File

var mainPath : String = "/home/ubuntu/etc/PermitNow/settings.xml"


object ReadXMLResources {
    fun getConfiguration() : PermitNowConfiguration {
        val xmlFile = if(File(mainPath).exists()) {
            File(mainPath)
        }else{
            File(xmlPath)
        }

        val serializer = Persister()
        val configuration = serializer.read(PermitNowConfiguration::class.java, xmlFile)

        return configuration
    }
}

