import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';

const BRAND = '#1D9E75';

export function LicencePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      <SpidLock pageName="Licenze" isLocked={true}>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
          >
            <DocumentIcon />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Le tue licenze
          </h1>
          <p className="mt-3 max-w-md text-gray-600">
            Carica e gestisci le tue licenze di pesca, caccia e attività
            boschive.
          </p>
        </main>
      </SpidLock>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}
