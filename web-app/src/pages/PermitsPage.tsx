import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';

const BRAND = '#1D9E75';

export function PermitsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      <SpidLock pageName="Permessi">
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
          >
            <TicketIcon />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            I tuoi permessi
          </h1>
          <p className="mt-3 max-w-md text-gray-600">
            Richiedi e consulta i permessi attivi nella tua area.
          </p>
        </main>
      </SpidLock>
    </div>
  );
}

function TicketIcon() {
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
      <path d="M3 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M13 5v14" strokeDasharray="2 3" />
    </svg>
  );
}
