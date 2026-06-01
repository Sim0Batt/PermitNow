import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { licenseApi } from '../api/license';
import type { FishingLicenseInfoJson } from '../types/models';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

export function WalletPage() {
  const { userId } = useAuth();
  const [license, setLicense] = useState<FishingLicenseInfoJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    licenseApi
      .getUserLicense(userId)
      .then(setLicense)
      .catch(() => setError('Impossibile caricare le licenze. Riprova più tardi.'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <NavBar />
      <SpidLock pageName="Wallet">
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">Il tuo wallet</h1>
          <p className="mb-8 text-sm text-gray-500">
            Le tue licenze e permessi sempre con te.
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

          {!loading && !error && !license && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
              >
                <FishIcon />
              </div>
              <p className="mt-4 text-base font-medium text-gray-700">Nessuna licenza trovata</p>
              <p className="mt-1 text-sm text-gray-500">
                Le tue licenze appariranno qui una volta emesse.
              </p>
            </div>
          )}

          {license && <FishingLicenseCard license={license} />}
        </main>
      </SpidLock>
    </div>
  );
}

function FishingLicenseCard({ license }: { license: FishingLicenseInfoJson }) {
  const expired = new Date(license.expirationDate) < new Date();
  const statusLabel =
    license.status === 'active'
      ? 'Attiva'
      : license.status === 'expired' || expired
        ? 'Scaduta'
        : license.status === 'pending'
          ? 'In attesa'
          : license.status;

  const statusColor =
    license.status === 'active' && !expired
      ? 'bg-emerald-100 text-emerald-700'
      : license.status === 'pending'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  const formattedExpiry = new Date(license.expirationDate).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-md"
      style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <FishIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Licenza di Pesca
            </p>
            <p className="text-base font-bold text-white">N° {license.licenseNumber}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Card body */}
      <div className="flex gap-4 bg-white/10 px-6 py-4 backdrop-blur-sm">
        {/* Details */}
        <div className="flex flex-1 flex-col gap-3">
          <CardField label="Stagione" value={license.season} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70">No Kill</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                license.noKill ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
              }`}
            >
              {license.noKill ? 'Sì' : 'No'}
            </span>
          </div>
          <CardField label="Scadenza" value={formattedExpiry} />
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl bg-white p-2 shadow-inner">
            <QRCodeSVG
              value={license.qrCodeToken}
              size={100}
              bgColor="#ffffff"
              fgColor="#1D9E75"
              level="M"
            />
          </div>
          <p className="text-center text-[10px] leading-tight text-white/60">
            Scansiona per
            <br />
            verificare
          </p>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-xs text-white/60">Licenza valida</p>
        <p className="text-sm font-semibold text-white">{statusLabel}</p>
      </div>
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function FishIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 12c0-3.5 2.5-6 6-6 4 0 7 3 7 6s-3 6-7 6c-3.5 0-6-2.5-6-6Z" />
      <path d="M6.5 12H2l2-3-2-3h4.5" />
      <circle cx="17" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
