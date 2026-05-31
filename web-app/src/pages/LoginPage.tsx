import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

// TODO(auth): replace with real login page (issue #43)
export function LoginPlaceholderPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Accesso utente
        </h1>
        <p className="mt-3 max-w-md text-gray-600">(issue #43).</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-8 rounded-lg bg-[#1D9E75] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64]"
        >
          Torna alla home
        </button>
      </main>
    </div>
  );
}
