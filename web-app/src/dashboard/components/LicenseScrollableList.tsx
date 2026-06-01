import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { licenseApi } from '../../api/license';
import type { LicenseListItem } from '../../types/models';

interface LicensesListProps {
  limit: number;
  maxHeight?: string | number;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'VALID':
      return 'text-green-700 bg-green-100';
    case 'PENDING':
      return 'text-yellow-700 bg-yellow-100';
    default:
      return 'text-gray-700 bg-gray-200';
  }
};

export const LicenseScrollableList = ({
  limit = 10,
  maxHeight = '400px',
}: LicensesListProps) => {
  const [licenses, setLicenses] = useState<LicenseListItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLicenses = async () => {
      const data = await licenseApi.listLicenses();
      setLicenses(limit === 0 ? data : data.slice(0, limit));
    };

    fetchLicenses();
  }, [limit]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return licenses;
    return licenses.filter((record) =>
      `${record.name} ${record.surname} ${record.email} ${record.licenseNumber}`
        .toLowerCase()
        .includes(q)
    );
  }, [licenses, search]);

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
          placeholder="Cerca per nome, cognome, email o numero licenza..."
          className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {licenses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nessuna licenza trovata.</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Nessun risultato per la ricerca.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filteredRecords.map((record) => (
            <li
              key={record.userId}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-black hover:border-gray-100"
              onClick={() => navigate(`/dashboard/licenses/${record.userId}`)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {record.name} {record.surname}
                </span>
                <span className="text-sm text-gray-600">{record.email}</span>
                <span className="text-xs text-gray-500">
                  Licenza: {record.licenseNumber}
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
