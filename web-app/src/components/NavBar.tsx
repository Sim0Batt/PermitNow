import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

export function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, verified, logout } = useAuth();

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* TODO(auth): admin role should navigate to /dashboard */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-lg font-bold text-gray-900"
        >
          <LeafIcon className="h-6 w-6" style={{ color: BRAND }} />
          <span>PermitNow</span>
        </button>

        <ul className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          {isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={() => navigate('/wallet')}
                  className="flex items-center gap-1.5 transition-colors hover:text-[#1D9E75]"
                >
                  {!verified && (
                    <LockIcon className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  Wallet
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/licence')}
                  className="flex items-center gap-1.5 transition-colors hover:text-[#1D9E75]"
                >
                  {!verified && (
                    <LockIcon className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  Licenze
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/permits')}
                  className="flex items-center gap-1.5 transition-colors hover:text-[#1D9E75]"
                >
                  {!verified && (
                    <LockIcon className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  Permessi
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/profile')}
                  className="transition-colors hover:text-[#1D9E75]"
                >
                  Profilo
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => scrollTo('servizi')}
                  className="transition-colors hover:text-[#1D9E75]"
                >
                  Servizi
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('come-funziona')}
                  className="transition-colors hover:text-[#1D9E75]"
                >
                  Come funziona
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="transition-colors hover:text-[#1D9E75]"
                >
                  FAQ
                </button>
              </li>
            </>
          )}
        </ul>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Ciao, utente
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="rounded-lg bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64]"
              >
                Registrati
              </button>
            </>
          )}
        </div>
      </nav>

      {isAuthenticated && !verified && (
        <div
          className="border-t border-gray-200"
          style={{ backgroundColor: `${BRAND}1A` }}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: BRAND_DARK }}
            >
              <LockIcon className="h-4 w-4 shrink-0" />
              Verifica la tua identità con SPID per sbloccare tutte le
              funzionalità.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="shrink-0 rounded-lg bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64]"
            >
              Verifica ora
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

function LeafIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 11-11 1 5 0 11-4 14a7 7 0 0 1-7 7Z" />
      <path d="M2 22c5-2 8-5 11-9" />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
