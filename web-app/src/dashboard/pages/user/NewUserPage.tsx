import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/admin';
import { NavBarDashboard } from '../../components/NavBarDashboard';

export const NewUserPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminApi.createUser({ name, surname, email, password, fiscalCode });
      navigate('/dashboard/user');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Errore durante la creazione dell\'utente.';
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
          onClick={() => navigate('/dashboard/user')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna alla lista
        </button>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Nuovo utente</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="Cognome" value={surname} onChange={setSurname} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Password" value={password} onChange={setPassword} type="password" />
          <Field label="Codice fiscale" value={fiscalCode} onChange={setFiscalCode} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {submitting ? 'Creazione in corso...' : 'Crea utente'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
