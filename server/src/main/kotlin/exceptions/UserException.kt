package exceptions

class UserException(val customMessage: String): Exception() {
    override val message: String = "User Exception: $customMessage"
}