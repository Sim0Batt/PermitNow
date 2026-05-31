import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const BRAND = '#1D9E75';

interface SpidLockProps {
  children: ReactNode;
  pageName: string;
  isLocked: boolean;
}

// TODO(auth): wrap with real verified check from UserAuthContext
export function SpidLock({ children, pageName, isLocked }: SpidLockProps) {
  const navigate = useNavigate();

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        className="pointer-events-none flex flex-1 flex-col opacity-40 blur-sm"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
          >
            <LockIcon />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
            Accesso limitato
          </h2>
          <p className="mt-3 text-gray-600">
            Verifica la tua identità con SPID per accedere a {pageName}.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-6 w-full rounded-lg bg-[#1D9E75] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64]"
          >
            Verifica con SPID
          </button>
          <p className="mt-4 text-xs text-gray-500">
            La verifica richiede pochi minuti ed è completamente gratuita.
          </p>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
