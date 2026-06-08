import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permitApi } from '../../../api/permit';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { PermitForm, type PermitFormValues } from '../../components/PermitForm';

export const NewPermitPage = () => {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: PermitFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await permitApi.createPermit(values);
      navigate('/dashboard/permits');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Errore durante la creazione del permesso.';
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
          onClick={() => navigate('/dashboard/permits')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna alla lista
        </button>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Nuovo permesso</h1>

        <PermitForm
          submitLabel="Crea permesso"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
