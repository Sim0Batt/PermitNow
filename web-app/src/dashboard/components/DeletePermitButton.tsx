import { useState } from 'react';
import { permitsApi } from '../../api/permits';
import { ConfirmDialog } from './ConfirmDialog';

interface DeletePermitButtonProps {
  permitId: string;
  permitLabel: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export const DeletePermitButton = ({
  permitId,
  permitLabel,
  disabled,
  onSuccess,
}: DeletePermitButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await permitsApi.deletePermit(permitId);
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
        Elimina permesso
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <ConfirmDialog
        open={open}
        title="Elimina permesso"
        message={`Eliminare il permesso ${permitLabel}? L'operazione non è reversibile.`}
        confirmLabel={loading ? 'Eliminazione...' : 'Elimina'}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!loading) setOpen(false);
        }}
      />
    </div>
  );
};
