package configuration

import org.simpleframework.xml.Element
import org.simpleframework.xml.Root


@Root(name = "Database", strict = false)
object DatabaseConfiguration {
    @field:Element(name = "ConnectionUrl", required = false)
    var connectionUrl: String = ""

    @field:Element(name = "DBName", required = false)
    var dbName: String = ""

}