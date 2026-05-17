import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { UserListItem } from '../../types/models';

interface UsersListProps {
  limit: number;
  maxHeight?: string | number;
}

export const UserScrollableList = ({
  limit = 10,
  maxHeight = '400px',
}: UsersListProps) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await adminApi.listUsers();
      setUsers(limit === 0 ? data : data.slice(0, limit));
    };

    fetchUsers();
  }, [limit]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((record) =>
      `${record.name} ${record.surname} ${record.email}`
        .toLowerCase()
        .includes(q)
    );
  }, [users, search]);

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
          placeholder="Cerca per nome, cognome o email..."
          className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nessun utente trovato.</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Nessun risultato per la ricerca.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filteredRecords.map((record) => (
            <li
              key={record.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-black hover:border-gray-100"
              onClick={() => navigate(`/dashboard/user/${record.id}`)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {record.name} {record.surname}
                </span>
                <span className="text-sm text-gray-600">{record.email}</span>
                <span className="text-xs text-gray-500">Ruolo: {record.role}</span>
              </div>

              <div className="flex items-center gap-2">
                {record.deleted && (
                  <span className="text-xs font-bold px-2 py-1 rounded text-gray-700 bg-gray-200">
                    ELIMINATO
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    record.verified
                      ? 'text-green-700 bg-green-100'
                      : 'text-red-700 bg-red-100'
                  }`}
                >
                  {record.verified ? 'VERIFICATO' : 'NON VERIFICATO'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
