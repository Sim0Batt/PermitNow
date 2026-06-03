import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { licenseApi } from '../api/license';
import type { FishingLicenseInfoJson } from '../types/models';
import { FishingLicenseCard } from '../components/FishingLicenseCard';
import { FishIcon } from '../components/FishIcon';

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





