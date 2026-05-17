import { useState } from 'react';
import { adminApi } from '../../api/admin';

interface VerifyUserButtonProps {
  userId: string;
  verified: boolean;
  disabled?: boolean;
  onSuccess?: () => void;
}

export const VerifyUserButton = ({
  userId,
  verified,
  disabled,
  onSuccess,
}: VerifyUserButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminApi.verifyUser(userId);
      onSuccess?.();
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: unknown }).message)
          : 'Errore durante la verifica';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={loading || disabled}
        onClick={handleClick}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? 'Aggiornamento...'
          : verified
          ? 'Rimuovi verifica'
          : 'Verifica utente'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
