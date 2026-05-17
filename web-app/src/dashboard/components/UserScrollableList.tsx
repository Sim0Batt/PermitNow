import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface UsersListProps {
  limit: number;
  maxHeight?: string | number;
}

interface UserRecord {
  userId: number;
  name: string;
  surname: string;
  password: string;
  role: string;
  email: string;
  fiscalCode: string;
  verified: boolean;
}

const isUserVerified = (
  verified: string | boolean | number | null | undefined
) => {
  if (typeof verified === 'boolean') return verified;
  if (typeof verified === 'number') return verified === 1;
  if (typeof verified === 'string')
    return verified.trim().toLowerCase() === 'true';
  return false;
};

export const UserScrollableList = ({
  limit = 10,
  maxHeight = '400px',
}: UsersListProps) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [fiscalCodeSearch, setFiscalCodeSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const usersResponse = await apiClient.get('/user/list');

      const userFormattedData: UserRecord[] = (usersResponse.data ?? []).map(
        (item: UserRecord) => ({
          userId: item.userId,
          name: item.name,
          surname: item.surname,
          password: item.password,
          role: item.role,
          email: item.email,
          fiscalCode: item.fiscalCode,
          verified: item.verified,
        })
      );

      console.log(userFormattedData);

      if (limit === 0) {
        setUsers(userFormattedData);
      } else {
        setUsers(userFormattedData.slice(0, limit));
      }
    };

    fetchUsers();
  }, [limit]);

  const filteredRecords = useMemo(() => {
    const q = fiscalCodeSearch.trim().toUpperCase();
    if (!q) return users;
    return users.filter((record) =>
      record.fiscalCode?.toUpperCase().includes(q)
    );
  }, [users, fiscalCodeSearch]);

  const navigate = useNavigate();

  const goToPage = (path: string) => {
    navigate(path);
  };

  return (
    <div
      className="overflow-y-auto p-2 "
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div className="mb-3 flex justify-end">
        <input
          type="text"
          value={fiscalCodeSearch}
          onChange={(e) => setFiscalCodeSearch(e.target.value)}
          placeholder="Cerca per codice fiscale..."
          className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nessun utente trovato.</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Nessun risultato per il codice fiscale cercato.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filteredRecords.map((record) => (
            <li
              key={record.userId}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-black hover:border-gray-100"
              onClick={() => goToPage('/dashboard/user/' + record.userId)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {record.name} {record.surname}
                </span>
                <span className="text-sm text-gray-600">{record.email}</span>
                <span className="text-xs text-gray-500">
                  CF: {record.fiscalCode}
                </span>
              </div>

              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  isUserVerified(record.verified)
                    ? 'text-green-700 bg-green-100'
                    : 'text-red-700 bg-red-100'
                }`}
              >
                {isUserVerified(record.verified)
                  ? 'VERIFICATO'
                  : 'NON VERIFICATO'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
