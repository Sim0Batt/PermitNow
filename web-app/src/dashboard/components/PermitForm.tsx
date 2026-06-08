import { useState } from 'react';

export interface PermitFormValues {
  userId: string;
  zone: string;
  type: string;
  noKill: boolean;
  startDate: string;
  numberOfRods: number;
  maxCatch: number;
}

// Mirrors utils.models.FishingZone on the server
const ZONES = [
  'ALTO_SARCA',
  'BASSO_SARCA',
  'VAL_DI_NON',
  'VALSUGANA',
  'ALTO_CHIESE',
  'LAGO_DI_GARDA',
  'LAGO_DI_TOVEL',
  'LAGO_DI_SANTA_GIUSTINA',
  'LAGO_DI_LEDRO',
  'LAGO_DI_CAVEDINE',
  'FIUME_ADIGE',
  'FIUME_BRENTA',
  'ALTO_ADIGE_BOLZANO',
  'VAL_PUSTERIA',
  'VAL_GARDENA',
];

// Permit types accepted by PermitManager.createPermit
const TYPES = ['GIORNALIERO', 'SETTIMANALE', 'ANNUALE'];

const EMPTY: PermitFormValues = {
  userId: '',
  zone: ZONES[0],
  type: TYPES[0],
  noKill: false,
  startDate: '',
  numberOfRods: 1,
  maxCatch: 0,
};

interface PermitFormProps {
  initial?: PermitFormValues;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: PermitFormValues) => void;
}

export const PermitForm = ({
  initial,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: PermitFormProps) => {
  const [values, setValues] = useState<PermitFormValues>(initial ?? EMPTY);

  const set = <K extends keyof PermitFormValues>(
    key: K,
    value: PermitFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <TextField
        label="ID utente"
        value={values.userId}
        onChange={(v) => set('userId', v)}
        required
      />

      <SelectField
        label="Zona"
        value={values.zone}
        options={ZONES}
        onChange={(v) => set('zone', v)}
      />

      <SelectField
        label="Tipo"
        value={values.type}
        options={TYPES}
        onChange={(v) => set('type', v)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Data di inizio</label>
        <input
          type="date"
          value={values.startDate}
          onChange={(e) => set('startDate', e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <SelectField
        label="Numero di canne"
        value={String(values.numberOfRods)}
        options={['1', '2']}
        onChange={(v) => set('numberOfRods', Number(v))}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Cattura massima</label>
        <input
          type="number"
          min={0}
          value={values.noKill ? 0 : values.maxCatch}
          disabled={values.noKill}
          onChange={(e) => set('maxCatch', Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        {values.noKill && (
          <span className="text-xs text-gray-500">
            I permessi no kill non prevedono una quota di cattura.
          </span>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={values.noKill}
          onChange={(e) => set('noKill', e.target.checked)}
        />
        No kill
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? 'Salvataggio in corso...' : submitLabel}
      </button>
    </form>
  );
};

const TextField = ({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
