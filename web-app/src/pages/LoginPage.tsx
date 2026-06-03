import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { NavBar } from '../components/NavBar';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

interface UserResponse {
  userId: string;
  verified?: boolean;
}

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userResponse = await authApi.login({ email, password }) as UserResponse;
      // Verified status is currently unknown until backend exposes /me.
      console.log('Login successful, user ID:', userResponse.userId, 'Verified:', userResponse.verified);
      loginUser(userResponse.userId, userResponse.verified ?? false);
      navigate('/');
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 400) {
        setError(axiosErr.response.data?.error ?? 'Credenziali non valide.');
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
            Accedi al tuo account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Entra per gestire licenze e permessi dal tuo wallet digitale.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Non hai ancora un account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-semibold text-[#1D9E75] transition-colors hover:text-[#178a64]"
            >
              Registrati
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
