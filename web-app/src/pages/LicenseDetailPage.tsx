import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { licenseApi } from '../api/license';
import type { FishingLicenseInfoJson } from '../types/models';
import { formatDateIt } from '../utils/date';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

export function LicenseDetailPage() {
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();
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
      .then((data) => {
        if (data && data.id === id) {
          setLicense(data);
        } else {
          setError('Licenza non trovata.');
        }
      })
      .catch(() => setError('Impossibile caricare la licenza. Riprova più tardi.'))
      .finally(() => setLoading(false));
  }, [userId, id]);

  console.log(license)

  const statusLabel = license
    ? license.status === 'VALID'
      ? 'Attiva'
      : license.status === 'PENDING'
        ? 'In verifica'
        : license.status === 'DELETED'
          ? 'Eliminata'
          : license.status
    : '';

  const statusColor =
    license?.status === 'VALID'
      ? 'bg-emerald-100 text-emerald-700'
      : license?.status === 'PENDING'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  const formattedExpiry = license ? formatDateIt(license.expirationDate) : '';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <NavBar />
      <SpidLock pageName="Dettaglio Licenza">
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          {/* Back link */}
          <Link
            to="/wallet"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Torna al Wallet
          </Link>

          <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
            Dettaglio licenza
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            Tutti i dati relativi alla tua licenza di pesca.
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

          {!loading && !error && license && (
            <div className="space-y-6">
              {/* Header card */}
              <div
                className="overflow-hidden rounded-2xl shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                }}
              >
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

                {/* QR code centered */}
                <div className="flex flex-col items-center gap-2 bg-white/10 px-6 py-5 backdrop-blur-sm">
                  <div className="rounded-xl bg-white p-3 shadow-inner">
                    <QRCodeSVG
                      value={license.qrCodeToken}
                      size={140}
                      bgColor="#ffffff"
                      fgColor={BRAND}
                      level="M"
                    />
                  </div>
                  <p className="mt-1 text-center text-xs text-white/60">
                    Scansiona per verificare la licenza
                  </p>
                </div>
              </div>

              {/* Details card */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                <DetailRow label="ID Licenza" value={license.id} mono />
                <DetailRow label="Numero licenza" value={license.licenseNumber} />
                <DetailRow label="Stagione" value={license.season} />
                <DetailRow label="Rilasciata da" value={license.releasedBy} />
                <DetailRow label="Scadenza" value={formattedExpiry} />
                <DetailRow
                  label="No Kill"
                  value={license.noKill ? 'Sì' : 'No'}
                  valueClassName={license.noKill ? 'text-emerald-600 font-semibold' : 'text-gray-500'}
                />
                <DetailRow label="Stato" value={statusLabel} />

                {/* bookCode as link to future fishing book page */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-gray-500">Libretto di pesca</span>
                  <Link
                    to={`/book/${license.bookCode}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                    style={{ color: BRAND }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${BRAND}1A`)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent')
                    }
                  >
                    {license.bookCode} →
                  </Link>
                </div>
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
        className={`text-sm font-medium text-gray-900 text-right ${mono ? 'font-mono text-xs' : ''} ${valueClassName ?? ''}`}
      >
        {value}
      </span>
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
