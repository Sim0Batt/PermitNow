import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { permitsApi } from '../api/permits';
import { formatDateIt } from '../utils/date';
import {
  zoneLabel,
  permitTypeLabel,
  permitStatusLabel,
  permitStatusStyle,
} from '../utils/permits';
import type { FishingPermit } from '../types/models';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

export function PermitDetailPage() {
  const { userId } = useAuth();
  const { permitId } = useParams<{ permitId: string }>();
  const navigate = useNavigate();

  const [permit, setPermit] = useState<FishingPermit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermit = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const permits = await permitsApi.getPermitsByUser(userId);
      const found = permits.find((p) => p.permitId === permitId) ?? null;
      setPermit(found);
      if (!found) setError('Permesso non trovato.');
    } catch {
      setError('Impossibile caricare il permesso. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }, [userId, permitId]);

  useEffect(() => {
    loadPermit();
  }, [loadPermit]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <NavBar />
      <SpidLock pageName="Dettaglio Permesso">
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          <button
            type="button"
            onClick={() => navigate('/permits')}
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            ← Torna ai permessi
          </button>

          <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
            Dettaglio permesso
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            Tutti i dati relativi al tuo permesso di pesca.
          </p>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
                style={{ borderTopColor: BRAND }}
              />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && permit && (
            <div className="space-y-6">
              {/* Header card with QR */}
              <div
                className="overflow-hidden rounded-2xl shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                }}
              >
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                      Permesso di Pesca
                    </p>
                    <p className="text-base font-bold text-white">
                      {zoneLabel(permit.zone)} · {permitTypeLabel(permit.type)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${permitStatusStyle(
                      permit.status
                    )}`}
                  >
                    {permitStatusLabel(permit.status)}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2 bg-white/10 px-6 py-5 backdrop-blur-sm">
                  <div className="rounded-xl bg-white p-3 shadow-inner">
                    <QRCodeSVG
                      value={permit.qrCodeToken}
                      size={140}
                      bgColor="#ffffff"
                      fgColor={BRAND}
                      level="M"
                    />
                  </div>
                  <p className="mt-1 text-center text-xs text-white/60">
                    Scansiona per verificare il permesso
                  </p>
                </div>
              </div>

              {/* Details card */}
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <DetailRow label="ID permesso" value={permit.permitId} mono />
                <DetailRow label="Zona" value={zoneLabel(permit.zone)} />
                <DetailRow label="Tipo" value={permitTypeLabel(permit.type)} />
                <DetailRow label="Stato" value={permitStatusLabel(permit.status)} />
                <DetailRow label="Data inizio" value={formatDateIt(permit.startDate)} />
                <DetailRow label="Data fine" value={formatDateIt(permit.endDate)} />
                <DetailRow label="Numero di canne" value={String(permit.numberOfRods)} />
                <DetailRow
                  label="No Kill"
                  value={permit.noKill ? 'Sì' : 'No'}
                  valueClassName={
                    permit.noKill ? 'text-emerald-600 font-semibold' : 'text-gray-500'
                  }
                />
                <DetailRow
                  label="Prezzo"
                  value={permit.price === 0 ? 'Gratuito' : `${permit.price}€`}
                />
              </div>
            </div>
          )}
        </main>
      </SpidLock>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  valueClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-right text-sm font-medium text-gray-900 ${mono ? 'font-mono text-xs' : ''} ${valueClassName ?? ''}`}
      >
        {value}
      </span>
    </div>
  );
}
