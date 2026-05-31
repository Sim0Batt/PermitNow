import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';

const BRAND = '#1D9E75';

export function WalletPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      <SpidLock pageName="Wallet" isLocked={true}>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
          >
            <WalletIcon />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Il tuo wallet
          </h1>
          <p className="mt-3 max-w-md text-gray-600">
            Qui troverai tutte le tue licenze e permessi sempre disponibili.
          </p>
        </main>
      </SpidLock>
    </div>
  );
}

function WalletIcon() {
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
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M16 15h2" />
    </svg>
  );
}
