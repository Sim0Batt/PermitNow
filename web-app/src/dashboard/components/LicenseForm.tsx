import { useState } from 'react';

export interface LicenseFormValues {
  licenseNumber: string;
  releasedBy: string;
  season: string;
  noKill: boolean;
  bookCode: string;
  expirationDate: string;
}

const EMPTY: LicenseFormValues = {
  licenseNumber: '',
  releasedBy: '',
  season: '',
  noKill: false,
  bookCode: '',
  expirationDate: '',
};

interface LicenseFormProps {
  initial?: LicenseFormValues;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: LicenseFormValues) => void;
}

export const LicenseForm = ({
  initial,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: LicenseFormProps) => {
  const [values, setValues] = useState<LicenseFormValues>(initial ?? EMPTY);

  const set = <K extends keyof LicenseFormValues>(
    key: K,
    value: LicenseFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <TextField
        label="Numero licenza"
        value={values.licenseNumber}
        onChange={(v) => set('licenseNumber', v)}
        required
      />
      <TextField
        label="Rilasciata da"
        value={values.releasedBy}
        onChange={(v) => set('releasedBy', v)}
      />
      <TextField
        label="Stagione"
        value={values.season}
        onChange={(v) => set('season', v)}
        required
      />
      <TextField
        label="Codice libretto"
        value={values.bookCode}
        onChange={(v) => set('bookCode', v)}
      />
      <TextField
        label="Scadenza"
        value={values.expirationDate}
        onChange={(v) => set('expirationDate', v)}
        required
      />

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
