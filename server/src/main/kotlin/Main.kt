import utils.TypesOfRun
import server.ServerConfig

internal object Main{
    @JvmStatic
    fun main(args: Array<String>) {
        val typeOfRun: TypesOfRun = when{
            args.isEmpty() -> TypesOfRun.HELP
            args[0] == "-h" || args[0] == "help" -> TypesOfRun.HELP
            args[0] == "-s" || args[0] == "server" -> TypesOfRun.SERVER
            args[0] == "-t" || args[0] == "test" -> TypesOfRun.TEST
            else -> TypesOfRun.HELP
        }

        when(typeOfRun){
            TypesOfRun.SERVER -> ServerConfig.run()
            TypesOfRun.HELP -> println(HELP_MESSAGE)
            TypesOfRun.TEST -> {

            }
        }
    }
}


private val HELP_MESSAGE: String = """
++*********************************************************++
                    PERMIT NOW SERVER
++*********************************************************++

Server for Permit Now Application.

USAGE: permitnowserver.jar [COMMAND]

COMMANDS:
help | -h | --help                      Prints helps message
server | -s                             Run Server
test | -t                               Debug test
    """.trimIndent()