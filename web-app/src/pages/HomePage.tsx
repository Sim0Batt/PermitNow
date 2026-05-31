import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

export function HomePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveNewsIndex((i) => (i + 1) % NEWS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* NavBar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <LeafIcon className="h-6 w-6" style={{ color: BRAND }} />
            <span>PermitNow</span>
          </button>

          <ul className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
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
          </ul>

          <div className="flex items-center gap-2">
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
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${BRAND}1A`, color: BRAND_DARK }}
            >
              Servizio pubblico digitale
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Le tue licenze e i tuoi permessi,
              <span style={{ color: BRAND }}> in un unico posto</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-600">
              Gestisci licenze di pesca, caccia e attività boschive con
              autenticazione SPID. Sicuro, semplice, sempre con te.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-lg bg-[#1D9E75] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64]"
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => scrollTo('servizi')}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                Scopri i servizi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servizi" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Servizi
            </h2>
            <p className="mt-3 text-gray-600">
              Tutto quello che ti serve per gestire licenze e permessi in
              un'unica piattaforma.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <article
                key={s.title}
                className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
                >
                  {s.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {s.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section id="notizie" className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Notizie e aggiornamenti
            </h2>
            <p className="mt-3 text-gray-600">Le ultime novità dal Trentino.</p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeNewsIndex * 100}%)` }}
            >
              {NEWS.map((item) => (
                <article
                  key={item.title}
                  className="flex w-full shrink-0 flex-col items-center rounded-xl border border-gray-200 bg-white p-10 text-center md:p-12"
                >
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: `${BRAND}1A`, color: BRAND_DARK }}
                  >
                    {item.tag}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold leading-snug text-gray-900 md:text-2xl">
                    {item.title}
                  </h3>
                  <time className="mt-3 text-sm text-gray-500">
                    {item.date}
                  </time>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {NEWS.map((item, idx) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveNewsIndex(idx)}
                aria-label={`Vai alla notizia ${idx + 1}`}
                aria-current={idx === activeNewsIndex}
                className="h-2 w-2 rounded-full transition-colors"
                style={{
                  backgroundColor: idx === activeNewsIndex ? BRAND : '#d1d5db',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="come-funziona" className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Come funziona
            </h2>
            <p className="mt-3 text-gray-600">
              Quattro passaggi per accedere a tutti i tuoi documenti.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, idx) => (
              <li
                key={step.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  {idx + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Domande frequenti
          </h2>

          <ul className="mt-10 divide-y divide-gray-200 border-t border-b border-gray-200">
            {FAQS.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <li key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-semibold text-gray-900">
                      {faq.q}
                    </span>
                    <ChevronIcon
                      className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <p className="pb-5 pr-9 text-sm leading-relaxed text-gray-600">
                      {faq.a}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ backgroundColor: BRAND }}>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Pronto a iniziare?
            </h2>
            <p className="mt-2 text-white/90">
              Registrati gratuitamente e inizia a gestire licenze e permessi dal
              tuo dispositivo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="rounded-lg bg-white px-6 py-3 text-base font-semibold shadow-sm transition-colors hover:bg-gray-100"
            style={{ color: BRAND_DARK }}
          >
            Inizia ora — Registrati
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LeafIcon className="h-5 w-5" style={{ color: BRAND }} />
            <span>© 2026 PermitNow</span>
          </div>
          <ul className="flex flex-wrap gap-6 text-sm text-gray-600">
            <li>
              <button
                onClick={() => navigate('/privacy')}
                className="transition-colors hover:text-[#1D9E75]"
              >
                Privacy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/accessibilita')}
                className="transition-colors hover:text-[#1D9E75]"
              >
                Accessibilità
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/contatti')}
                className="transition-colors hover:text-[#1D9E75]"
              >
                Contatti
              </button>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

// --- icons ---

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

function ChevronIcon({ className }: IconProps) {
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
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FishIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6.5 12c.5-3 3-6 8-6 3.5 0 6 2 7 3-1 1.5-3 3-3 3s2 1.5 3 3c-1 1-3.5 3-7 3-5 0-7.5-3-8-6Z" />
      <circle cx="16" cy="11" r="0.5" fill="currentColor" />
      <path d="M6.5 12C5 11 3 11 2 12c1 1 3 1 4.5 0Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 3 6 11h3l-4 6h5v4h4v-4h5l-4-6h3z" />
    </svg>
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
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M16 15h2" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  );
}

// --- content ---

const SERVICES: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'Permessi pesca',
    description:
      'Richiedi, rinnova e consulta i tuoi permessi di pesca in acque interne.',
    icon: <FishIcon />,
  },
  {
    title: 'Permessi caccia',
    description:
      'Gestisci i permessi di caccia regionali con scadenze sempre aggiornate.',
    icon: <TargetIcon />,
  },
  {
    title: 'Attività boschive',
    description:
      'Permessi per raccolta legna, funghi e tartufi nei territori autorizzati.',
    icon: <TreeIcon />,
  },
  {
    title: 'Wallet digitale',
    description:
      'Tutti i tuoi documenti accessibili dal telefono, anche offline.',
    icon: <WalletIcon />,
  },
  {
    title: 'Mappa zone',
    description:
      'Consulta zone consentite, orari e periodi di apertura sul territorio.',
    icon: <MapIcon />,
  },
];

const NEWS = [
  {
    title: 'Nuove zone di pesca autorizzate in Trentino',
    date: '28 maggio 2026',
    tag: 'Aggiornamento',
  },
  {
    title: 'Apertura stagione caccia 2026: tutte le informazioni',
    date: '15 maggio 2026',
    tag: 'Stagione',
  },
  {
    title: 'PermitNow prossimamente disponibile su App Store e Google Play',
    date: '2 maggio 2026',
    tag: 'Novità',
  },
];

const STEPS = [
  {
    title: 'Registrati',
    description: 'Crea un account con email e password.',
  },
  {
    title: 'Verifica con SPID',
    description:
      'Autentica la tua identità digitale per sbloccare tutte le funzionalità.',
  },
  {
    title: 'Carica le licenze',
    description:
      "Scansiona le tue licenze esistenti per verificarne l'autenticità",
  },
  {
    title: 'Richiedi i permessi',
    description: 'Compila le richieste online e gestisci tutto dal wallet.',
  },
];

const FAQS = [
  {
    q: "Cos'è PermitNow?",
    a: 'PermitNow è una piattaforma pubblica per gestire licenze di caccia, pesca e attività boschive. Puoi autenticare le licenze esistenti e richiedere nuovi permessi, tutto online.',
  },
  {
    q: 'Come mi registro?',
    a: 'Puoi registrarti con email e password. Per richiedere permessi e accedere a tutte le funzionalità è necessario verificare la tua identità tramite SPID.',
  },
  {
    q: 'Quanto costa?',
    a: "L'utilizzo di PermitNow è gratuito. I permessi possono avere costi previsti dalle normative regionali vigenti.",
  },
  {
    q: 'Posso usarlo offline?',
    a: 'Sì, il wallet è consultabile anche offline. Licenze e permessi salvati sono sempre disponibili dal tuo dispositivo.',
  },
];
