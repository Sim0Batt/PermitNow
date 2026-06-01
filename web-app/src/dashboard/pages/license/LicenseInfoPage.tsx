import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { licenseApi } from '../../../api/license';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { DeleteLicenseButton } from '../../components/DeleteLicenseButton';
import type { LicenseListItem } from '../../../types/models';

export const LicenseInfoPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [license, setLicense] = useState<LicenseListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLicense = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await licenseApi.listLicenses();
      const found = all.find((l) => l.userId === userId) ?? null;
      setLicense(found);
      if (!found) setError('Licenza non trovata.');
    } catch {
      setError('Errore nel caricamento della licenza.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLicense();
  }, [loadLicense]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10">
        <button
          onClick={() => navigate('/dashboard/licenses')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna alla lista
        </button>

        {loading && <p className="mt-6 text-gray-500">Caricamento...</p>}
        {error && !loading && <p className="mt-6 text-red-600">{error}</p>}

        {license && !loading && (
          <div className="mt-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">
              {license.name} {license.surname}
            </h1>
            <p className="text-sm text-gray-600">{license.email}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Numero licenza" value={license.licenseNumber} />
              <Field label="Stato" value={license.status} />
              <Field label="Rilasciata da" value={license.releasedBy} />
              <Field label="Stagione" value={license.season} />
              <Field label="No kill" value={license.noKill ? 'Sì' : 'No'} />
              <Field label="Codice libretto" value={license.bookCode} />
              <Field label="Scadenza" value={license.expirationDate} />
              <Field label="QR code token" value={license.qrCodeToken} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/licenses/${license.userId}/edit`)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Modifica licenza
              </button>
              <DeleteLicenseButton
                userId={license.userId}
                licenseLabel={license.licenseNumber}
                onSuccess={() => navigate('/dashboard/licenses')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-gray-200 p-3">
    <div className="text-xs uppercase text-gray-500">{label}</div>
    <div className="mt-1 break-all text-sm text-gray-900">{value}</div>
  </div>
);
