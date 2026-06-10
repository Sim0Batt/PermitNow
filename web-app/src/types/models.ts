export interface LoginJson {
  email: string;
  password: string;
}

export interface RegisterJson {
  name: string;
  surname: string;
  email: string;
  password: string;
  fiscalCode: string;
  role: string;
}

export interface FishingLicenceJson {
  licenseText: string;
  userId: number;
}

export interface User {
  name: string;
  surname: string;
  fiscalCode: string;
  verified: boolean;
}

export interface UserListItem {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  verified: boolean;
  deleted: boolean;
}

// Mirrors server.models.output.UserProfileJson (no fiscalCode — never returned)
export interface UserProfileJson {
  userId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  verified: boolean;
}

// Mirrors server.models.input.ProfileUpdateJson
// fiscalCode may be sent blank: the server then leaves the stored code unchanged.
export interface ProfileUpdatePayload {
  name: string;
  surname: string;
  email: string;
  fiscalCode: string;
}

export interface Licence {
  licenseNumber: string;
  releasedBy: string;
  typeOfPermit: string;
  season: string;
  noKill: boolean;
  type: string;
  qrCodeToken: string;
  userId: number;
}

// Fishing license management (admin) — mirrors the server DTOs
export interface LicenseListItem {
  userId: string;
  name: string;
  surname: string;
  email: string;
  qrCodeToken: string;
  status: string;
  licenseNumber: string;
  releasedBy: string;
  season: string;
  noKill: boolean;
  bookCode: string;
  expirationDate: string;
}
export interface FishingLicense {
  qrCodeToken: string;
  status: string;
  licenseNumber: string;
  releasedBy: string;
  season: string;
  noKill: boolean;
  bookCode: string;
  expirationDate: string;
}

export interface FishingLicenseInfoJson {
  id: string;
  qrCodeToken: string;
  status: string;
  licenseNumber: string;
  releasedBy: string;
  season: string;
  noKill: boolean;
  bookCode: string;
  expirationDate: string;
}

export interface CreateLicensePayload {
  userId: string;
  licenseNumber: string;
  releasedBy: string;
  season: string;
  noKill: boolean;
  bookCode: string;
  expirationDate: string;
}

export interface FishingPage {
  id: string;
  bookId: string;
  date: string;
}

export interface FishingRow {
  id: string;
  pageId: string;
  fishName: string;
  zone: string;
  specie: string;
  measure: number;
}

export interface CreateFishingRowPayload {
  id: string;
  pageId: string;
  fishName: string;
  date: string;
  zone: string;
  specie: string;
  measure: number;
}

export interface UpdateLicensePayload {
  licenseNumber: string;
  releasedBy: string;
  season: string;
  noKill: boolean;
  bookCode: string;
  expirationDate: string;
}

// Fishing permit object — mirrors server.models.output.FishingPermitJson
export interface FishingPermit {
  permitId: string;
  userId: string;
  licenseId: string;
  zone: string;
  type: string;
  noKill: boolean;
  startDate: string;
  endDate: string;
  numberOfRods: number;
  maxCatch: number;
  price: number;
  status: string;
  qrCodeToken: string;
}

// Permit creation payload — mirrors server.models.input.FishingPermitRequestJson
// licenseId is intentionally omitted: the server derives it from the user's license.
export interface CreatePermitPayload {
  userId: string;
  zone: string;
  type: string;
  noKill: boolean;
  startDate: string;
  numberOfRods: number;
  maxCatch: number;
}
