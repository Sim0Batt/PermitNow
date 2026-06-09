export interface ZoneOption {
  value: string;
  label: string;
}

export interface PermitTypeOption {
  value: string;
  label: string;
  price: number;
}

// Mirrors utils.models.FishingZone on the server
export const ZONES: ZoneOption[] = [
  { value: 'ALTO_SARCA', label: 'Alto Sarca' },
  { value: 'BASSO_SARCA', label: 'Basso Sarca' },
  { value: 'VAL_DI_NON', label: 'Val di Non' },
  { value: 'VALSUGANA', label: 'Valsugana' },
  { value: 'ALTO_CHIESE', label: 'Alto Chiese' },
  { value: 'LAGO_DI_GARDA', label: 'Lago di Garda' },
  { value: 'LAGO_DI_TOVEL', label: 'Lago di Tovel' },
  { value: 'LAGO_DI_SANTA_GIUSTINA', label: 'Lago di Santa Giustina' },
  { value: 'LAGO_DI_LEDRO', label: 'Lago di Ledro' },
  { value: 'LAGO_DI_CAVEDINE', label: 'Lago di Cavedine' },
  { value: 'FIUME_ADIGE', label: 'Fiume Adige' },
  { value: 'FIUME_BRENTA', label: 'Fiume Brenta' },
  { value: 'ALTO_ADIGE_BOLZANO', label: 'Alto Adige / Bolzano' },
  { value: 'VAL_PUSTERIA', label: 'Val Pusteria' },
  { value: 'VAL_GARDENA', label: 'Val Gardena' },
];

// Permit types accepted by PermitManager.createPermit (prices from priceForType)
export const PERMIT_TYPES: PermitTypeOption[] = [
  { value: 'GIORNALIERO', label: 'Giornaliero', price: 23 },
  { value: 'SETTIMANALE', label: 'Settimanale', price: 80 },
  { value: 'ANNUALE', label: 'Annuale', price: 160 },
];

const PERMIT_STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const PERMIT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Attivo',
  EXPIRED: 'Scaduto',
  CANCELLED: 'Annullato',
};

// Resolve display labels/styles, falling back to the raw value when unknown.
export const zoneLabel = (zone: string): string =>
  ZONES.find((z) => z.value === zone)?.label ?? zone;

export const permitTypeLabel = (type: string): string =>
  PERMIT_TYPES.find((t) => t.value === type)?.label ?? type;

export const permitStatusLabel = (status: string): string =>
  PERMIT_STATUS_LABELS[status] ?? status;

export const permitStatusStyle = (status: string): string =>
  PERMIT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
