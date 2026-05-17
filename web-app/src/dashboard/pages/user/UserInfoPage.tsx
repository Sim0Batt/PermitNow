import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../../api/admin';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { VerifyUserButton } from '../../components/VerifyUserButton';
import { DeleteUserButton } from '../../components/DeleteUserButton';
import type { UserListItem } from '../../../types/models';

export const UserInfoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const all = await adminApi.listUsers();
      const found = all.find((u) => u.id === id) ?? null;
      setUser(found);
      if (!found) setError('Utente non trovato.');
    } catch {
      setError('Errore nel caricamento dell\'utente.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10">
        <button
          onClick={() => navigate('/dashboard/user')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Torna alla lista
        </button>

        {loading && <p className="mt-6 text-gray-500">Caricamento...</p>}
        {error && !loading && <p className="mt-6 text-red-600">{error}</p>}

        {user && !loading && (
          <div className="mt-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name} {user.surname}
            </h1>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="ID" value={user.id} />
              <Field label="Email" value={user.email} />
              <Field label="Ruolo" value={user.role} />
              <Field
                label="Verificato"
                value={user.verified ? 'Sì' : 'No'}
              />
              <Field
                label="Eliminato"
                value={user.deleted ? 'Sì' : 'No'}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <VerifyUserButton
                userId={user.id}
                verified={user.verified}
                disabled={user.deleted}
                onSuccess={loadUser}
              />
              <DeleteUserButton
                userId={user.id}
                userLabel={`${user.name} ${user.surname}`}
                disabled={user.deleted}
                onSuccess={() => navigate('/dashboard/user')}
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
