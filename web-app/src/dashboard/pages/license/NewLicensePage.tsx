import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { licenseApi } from '../../../api/license';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { LicenseForm, type LicenseFormValues } from '../../components/LicenseForm';

export const NewLicensePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LicenseFormValues) => {
    if (!userId) return;
    setError(null);
    setSubmitting(true);
    try {
      await licenseApi.createLicense({ userId, ...values });
      navigate(`/dashboard/licenses/${userId}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Errore durante la creazione della licenza.';
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
          onClick={() => navigate(`/dashboard/user/${userId}`)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna all'utente
        </button>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Nuova licenza</h1>

        <LicenseForm
          submitLabel="Crea licenza"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
