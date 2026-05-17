import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { ConfirmDialog } from './ConfirmDialog';

interface DeleteUserButtonProps {
  userId: string;
  userLabel: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export const DeleteUserButton = ({
  userId,
  userLabel,
  disabled,
  onSuccess,
}: DeleteUserButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminApi.deleteUser(userId);
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: unknown }).message)
          : 'Errore durante l\'eliminazione';
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
        onClick={() => setOpen(true)}
        className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        Elimina utente
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <ConfirmDialog
        open={open}
        title="Elimina utente"
        message={`Eliminare l'utente ${userLabel}? L'account verrà marcato come eliminato.`}
        confirmLabel={loading ? 'Eliminazione...' : 'Elimina'}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!loading) setOpen(false);
        }}
      />
    </div>
  );
};
