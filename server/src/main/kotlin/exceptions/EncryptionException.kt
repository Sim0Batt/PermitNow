package exceptions

class EncryptionException(val customMessage: String): Exception() {
    override val message: String = "Encryption Exception: $customMessage"
}