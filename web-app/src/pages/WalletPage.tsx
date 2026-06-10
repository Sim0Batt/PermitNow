import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { licenseApi } from '../api/license';
import { permitsApi } from '../api/permits';
import { formatDateIt, isPastDate } from '../utils/date';
import { zoneLabel, permitTypeLabel } from '../utils/permits';
import type { FishingLicenseInfoJson, FishingPermit } from '../types/models';
import { FishingLicenseCard } from '../components/FishingLicenseCard';
import { FishIcon } from '../components/FishIcon';

const BRAND = '#1D9E75';

export function WalletPage() {
  const { userId } = useAuth();
  const [license, setLicense] = useState<FishingLicenseInfoJson | null>(null);
  const [permits, setPermits] = useState<FishingPermit[]>([]);
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

    permitsApi
      .getPermitsByUser(userId)
      .then(setPermits)
      .catch(() => setPermits([]));
  }, [userId]);

  // Show only currently-valid permits: ACTIVE status and not past their end date.
  const activePermits = permits.filter(
    (p) => p.status === 'ACTIVE' && !isPastDate(p.endDate)
  );

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

          {!loading && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Permessi attivi
              </h2>
              {activePermits.length === 0 ? (
                <p className="text-sm text-gray-500">Nessun permesso attivo</p>
              ) : (
                <ul className="grid gap-4">
                  {activePermits.map((permit) => (
                    <WalletPermitCard key={permit.permitId} permit={permit} />
                  ))}
                </ul>
              )}
            </section>
          )}

        </main>
      </SpidLock>
    </div>
  );
}

function WalletPermitCard({ permit }: { permit: FishingPermit }) {
  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{zoneLabel(permit.zone)}</p>
          <p className="mt-0.5 text-sm text-gray-500">{permitTypeLabel(permit.type)}</p>
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Periodo:</span>{' '}
            {formatDateIt(permit.startDate)} → {formatDateIt(permit.endDate)}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="rounded-xl bg-white p-2 ring-1 ring-gray-100">
            <QRCodeSVG
              value={permit.qrCodeToken}
              size={84}
              bgColor="#ffffff"
              fgColor={BRAND}
              level="M"
            />
          </div>
          <p className="text-[10px] text-gray-400">Scansiona</p>
        </div>
      </div>
    </li>
  );
}





