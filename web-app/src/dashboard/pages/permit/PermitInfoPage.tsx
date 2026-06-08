import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { permitApi } from '../../../api/permit';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { DeletePermitButton } from '../../components/DeletePermitButton';
import type { PermitListItem } from '../../../types/models';

export const PermitInfoPage = () => {
  const { permitId } = useParams<{ permitId: string }>();
  const navigate = useNavigate();

  const [permit, setPermit] = useState<PermitListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermit = useCallback(async () => {
    if (!permitId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await permitApi.listPermits();
      const found = all.find((p) => p.permitId === permitId) ?? null;
      setPermit(found);
      if (!found) setError('Permesso non trovato.');
    } catch {
      setError('Errore nel caricamento del permesso.');
    } finally {
      setLoading(false);
    }
  }, [permitId]);

  useEffect(() => {
    loadPermit();
  }, [loadPermit]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10">
        <button
          onClick={() => navigate('/dashboard/permits')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna alla lista
        </button>

        {loading && <p className="mt-6 text-gray-500">Caricamento...</p>}
        {error && !loading && <p className="mt-6 text-red-600">{error}</p>}

        {permit && !loading && (
          <div className="mt-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">
              {permit.zone} · {permit.type}
            </h1>
            <p className="text-sm text-gray-600">Utente: {permit.userId}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID permesso" value={permit.permitId} />
              <Field label="Stato" value={permit.status} />
              <Field label="ID licenza" value={permit.licenseId} />
              <Field label="Zona" value={permit.zone} />
              <Field label="Tipo" value={permit.type} />
              <Field label="No kill" value={permit.noKill ? 'Sì' : 'No'} />
              <Field label="Data di inizio" value={permit.startDate} />
              <Field label="Data di fine" value={permit.endDate} />
              <Field label="Numero di canne" value={String(permit.numberOfRods)} />
              <Field label="Cattura massima" value={String(permit.maxCatch)} />
              <Field label="Prezzo" value={`${permit.price} €`} />
              <Field label="QR code token" value={permit.qrCodeToken} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <DeletePermitButton
                permitId={permit.permitId}
                permitLabel={`${permit.zone} · ${permit.type}`}
                onSuccess={() => navigate('/dashboard/permits')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-gray-200 p-3">
    <div className="text-xs uppercase text-gray-500">{label}</div>
    <div className="mt-1 break-all text-sm text-gray-900">{value}</div>
  </div>
);
