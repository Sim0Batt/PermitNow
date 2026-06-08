import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authApi } from '../api/auth';
import { NavBar } from '../components/NavBar';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // The server replies 200 with the literal body "FA" on failure
      // (duplicate email or invalid data), so we must inspect the result
      // rather than rely on a non-2xx status.
      const result = await authApi.register({
        name,
        surname,
        email,
        fiscalCode,
        password,
        role: 'user',
      });
      if (result === 'FA') {
        setError('Registrazione fallita: email già in uso o dati non validi.');
        return;
      }
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      if (axiosErr.response?.status === 400) {
        setError(axiosErr.response.data?.error ?? 'Dati di registrazione non validi.');
      } else if (axiosErr.response) {
        setError('Errore del server. Riprova più tardi.');
      } else {
        setError('Errore di connessione. Verifica che il server sia raggiungibile.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 py-14 md:py-20">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND_DARK }}
          >
            Benvenuto su PermitNow
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Crea il tuo account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registrati per gestire licenze e permessi dal tuo wallet digitale.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mario"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="surname" className="text-sm font-medium text-gray-700">
                Cognome
              </label>
              <input
                id="surname"
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Rossi"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.cognome@email.it"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fiscalCode" className="text-sm font-medium text-gray-700">
                Codice Fiscale
              </label>
              <input
                id="fiscalCode"
                type="text"
                required
                value={fiscalCode}
                onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                placeholder="RSSMRA80A01H501U"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-[#1D9E75] px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Hai già un account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-[#1D9E75] transition-colors hover:text-[#178a64]"
            >
              Accedi
            </button>
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Torna alla home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
