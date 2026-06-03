package exceptions

class FishingBookException(val customMessage: String): Exception() {
    override val message: String = "Fishing Book Exception: $customMessage"
}