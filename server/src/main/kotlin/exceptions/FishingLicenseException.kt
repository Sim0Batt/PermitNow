package exceptions

class FishingLicenseException(val customMessage: String): Exception() {
    override val message: String = "Fishing License Exception: $customMessage"
}