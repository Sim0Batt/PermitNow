import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permitsApi } from '../../api/permits';
import type { FishingPermit } from '../../types/models';

interface PermitsListProps {
  limit: number;
  maxHeight?: string | number;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-700 bg-green-100';
    case 'EXPIRED':
      return 'text-gray-700 bg-gray-200';
    case 'CANCELLED':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-200';
  }
};

export const PermitScrollableList = ({
  limit = 10,
  maxHeight = '400px',
}: PermitsListProps) => {
  const [permits, setPermits] = useState<FishingPermit[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPermits = async () => {
      const data = await permitsApi.listPermits();
      setPermits(limit === 0 ? data : data.slice(0, limit));
    };

    fetchPermits();
  }, [limit]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permits;
    return permits.filter((record) =>
      `${record.userId} ${record.zone} ${record.type}`
        .toLowerCase()
        .includes(q)
    );
  }, [permits, search]);

  const navigate = useNavigate();

  return (
    <div
      className="overflow-y-auto p-2 "
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div className="mb-3 flex justify-end">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per utente, zona o tipo..."
          className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {permits.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nessun permesso trovato.</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Nessun risultato per la ricerca.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filteredRecords.map((record) => (
            <li
              key={record.permitId}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-black hover:border-gray-100"
              onClick={() => navigate(`/dashboard/permits/${record.permitId}`)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {record.zone} · {record.type}
                </span>
                <span className="text-sm text-gray-600">
                  Utente: {record.userId}
                </span>
                <span className="text-xs text-gray-500">
                  {record.startDate} → {record.endDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${statusBadgeClass(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
