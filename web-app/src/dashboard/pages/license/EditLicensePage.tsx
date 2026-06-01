import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { licenseApi } from '../../../api/license';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { LicenseForm, type LicenseFormValues } from '../../components/LicenseForm';

export const EditLicensePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [initial, setInitial] = useState<LicenseFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadLicense = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const license = await licenseApi.getLicense(userId);
      setInitial({
        licenseNumber: license.licenseNumber,
        releasedBy: license.releasedBy,
        season: license.season,
        noKill: license.noKill,
        bookCode: license.bookCode,
        expirationDate: license.expirationDate,
      });
    } catch {
      setLoadError('Errore nel caricamento della licenza.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLicense();
  }, [loadLicense]);

  const handleSubmit = async (values: LicenseFormValues) => {
    if (!userId) return;
    setError(null);
    setSubmitting(true);
    try {
      await licenseApi.updateLicense(userId, values);
      navigate(`/dashboard/licenses/${userId}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Errore durante l\'aggiornamento della licenza.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10 max-w-lg">
        <button
          onClick={() => navigate(`/dashboard/licenses/${userId}`)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna alla licenza
        </button>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Modifica licenza</h1>

        {loading && <p className="mt-6 text-gray-500">Caricamento...</p>}
        {loadError && !loading && <p className="mt-6 text-red-600">{loadError}</p>}

        {initial && !loading && (
          <LicenseForm
            initial={initial}
            submitLabel="Salva modifiche"
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};
