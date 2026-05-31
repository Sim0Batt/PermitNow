package utils

import java.util.UUID

object UtilsFunctions {
    fun generateQRCodeToken(): String{
        return UUID.randomUUID().toString()
    }
}