import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { permitsApi } from '../api/permits';
import {
  ZONES,
  PERMIT_TYPES,
  zoneLabel,
  permitTypeLabel,
  permitStatusLabel,
  permitStatusStyle,
} from '../utils/permits';
import type { FishingPermit, CreatePermitPayload } from '../types/models';

const BRAND = '#1D9E75';

interface FormState {
  zone: string;
  type: string;
  startDate: string;
  numberOfRods: number;
  noKill: boolean;
  maxCatch: number;
}

const DEFAULT_FORM: FormState = {
  zone: ZONES[0].value,
  type: PERMIT_TYPES[0].value,
  startDate: '',
  numberOfRods: 1,
  noKill: false,
  maxCatch: 0,
};

export function PermitsPage() {
  const { userId } = useAuth();
  const [permits, setPermits] = useState<FishingPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPermits = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await permitsApi.getPermitsByUser(userId);
      setPermits(data);
    } catch {
      setError('Impossibile caricare i permessi. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPermits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreatePermitPayload = {
        userId,
        zone: form.zone,
        type: form.type,
        noKill: form.noKill,
        startDate: form.startDate,
        numberOfRods: form.numberOfRods,
        maxCatch: form.noKill ? 0 : form.maxCatch,
      };
      await permitsApi.requestPermit(payload);
      setForm(DEFAULT_FORM);
      await fetchPermits();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Richiesta non riuscita. Controlla i dati e riprova.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      <SpidLock pageName="Permessi">
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            I tuoi permessi
          </h1>

          {/* Request form */}
          <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Richiedi permesso
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Zona
                </label>
                <select
                  value={form.zone}
                  onChange={e =>
                    setForm(f => ({ ...f, zone: e.target.value }))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  required
                >
                  {ZONES.map(z => (
                    <option key={z.value} value={z.value}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={form.type}
                  onChange={e =>
                    setForm(f => ({ ...f, type: e.target.value }))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  required
                >
                  {PERMIT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.price}€
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Data inizio
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e =>
                    setForm(f => ({ ...f, startDate: e.target.value }))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Numero di canne
                </label>
                <select
                  value={form.numberOfRods}
                  onChange={e =>
                    setForm(f => ({ ...f, numberOfRods: Number(e.target.value) }))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  required
                >
                  <option value={1}>1 canna</option>
                  <option value={2}>2 canne</option>
                </select>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="noKill"
                  type="checkbox"
                  checked={form.noKill}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      noKill: e.target.checked,
                      maxCatch: e.target.checked ? 0 : f.maxCatch,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-[#1D9E75]"
                />
                <label
                  htmlFor="noKill"
                  className="text-sm font-medium text-gray-700"
                >
                  No-kill (rilascio obbligatorio)
                </label>
              </div>

              {!form.noKill && (
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Cattura massima (kg)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxCatch}
                    onChange={e =>
                      setForm(f => ({ ...f, maxCatch: Number(e.target.value) }))
                    }
                    className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                    required
                  />
                </div>
              )}

              {submitError && (
                <p className="text-sm text-red-600 sm:col-span-2">
                  {submitError}
                </p>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64] disabled:opacity-50"
                >
                  {submitting ? 'Invio in corso…' : 'Richiedi permesso'}
                </button>
              </div>
            </form>
          </section>

          {/* Permit list */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Permessi emessi
            </h2>
            {loading ? (
              <p className="text-sm text-gray-500">Caricamento in corso…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : permits.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nessun permesso trovato. Richiedi il tuo primo permesso sopra.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {permits.map(p => (
                  <PermitCard key={p.permitId} permit={p} />
                ))}
              </ul>
            )}
          </section>
        </main>
      </SpidLock>
    </div>
  );
}

function PermitCard({ permit }: { permit: FishingPermit }) {
  const navigate = useNavigate();

  return (
    <li
      onClick={() => navigate(`/permits/${permit.permitId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/permits/${permit.permitId}`);
      }}
      aria-label={`Apri dettaglio permesso ${zoneLabel(permit.zone)}`}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{zoneLabel(permit.zone)}</p>
          <p className="mt-0.5 text-sm text-gray-500">{permitTypeLabel(permit.type)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${permitStatusStyle(permit.status)}`}
        >
          {permitStatusLabel(permit.status)}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium">Periodo:</span>{' '}
          {permit.startDate} → {permit.endDate}
        </p>
        <p>
          <span className="font-medium">Prezzo:</span>{' '}
          {permit.price === 0 ? 'Gratuito' : `${permit.price}€`}
        </p>
        <p>
          <span className="font-medium">Canne:</span> {permit.numberOfRods}
        </p>
        {permit.noKill && (
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
          >
            No-kill
          </span>
        )}
      </div>
    </li>
  );
}
