import { QRCodeSVG } from "qrcode.react";
import type { FishingLicenseInfoJson } from "../types/models";
import { useNavigate } from "react-router-dom";
import { FishIcon } from "./FishIcon";


const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';


function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}


export function FishingLicenseCard({ license }: { license: FishingLicenseInfoJson }) {
  const navigate = useNavigate();
  const expirationDate = parseDDMMYYYY(license.expirationDate);
  const expired = expirationDate < new Date();
  const statusLabel =
    license.status === 'ACTIVE'
      ? 'Attiva'
      : license.status === 'EXPIRED' || expired
        ? 'Scaduta'
        : license.status === 'PENDING'
          ? 'In attesa'
          : license.status;

  const statusColor =
    license.status === 'ACTIVE' && !expired
      ? 'bg-emerald-100 text-emerald-700'
      : license.status === 'PENDING'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  const formattedExpiry = expirationDate.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-lg"
      style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
      onClick={() => navigate(`/licence/${license.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/licence/${license.id}`)}
      aria-label={`Apri dettaglio licenza N° ${license.licenseNumber}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <FishIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Licenza di Pesca
            </p>
            <p className="text-base font-bold text-white">N° {license.licenseNumber}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Card body */}
      <div className="flex gap-4 bg-white/10 px-6 py-4 backdrop-blur-sm">
        {/* Details */}
        <div className="flex flex-1 flex-col gap-3">
          <CardField label="Stagione" value={license.season} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70">No Kill</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                license.noKill ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
              }`}
            >
              {license.noKill ? 'Sì' : 'No'}
            </span>
          </div>
          <CardField label="Scadenza" value={formattedExpiry} />
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl bg-white p-2 shadow-inner">
            <QRCodeSVG
              value={license.qrCodeToken}
              size={100}
              bgColor="#ffffff"
              fgColor="#1D9E75"
              level="M"
            />
          </div>
          <p className="text-center text-[10px] leading-tight text-white/60">
            Scansiona per
            <br />
            verificare
          </p>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-xs text-white/60">Tocca per i dettagli</p>
        <p className="text-sm font-semibold text-white">{statusLabel}</p>
      </div>
    </div>
  );
}


function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}