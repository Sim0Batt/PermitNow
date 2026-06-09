import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { licenseApi } from '../api/license';
import type { FishingLicenseInfoJson } from '../types/models';

const BRAND = '#1D9E75';
const BRAND_DARK = '#178a64';

const statusLabel = (status: string): string => {
  switch (status) {
    case 'VALID':
      return 'Attiva';
    case 'PENDING':
      return 'In verifica';
    case 'DELETED':
      return 'Eliminata';
    default:
      return status;
  }
};

const statusColor = (status: string): string => {
  switch (status) {
    case 'VALID':
      return 'bg-emerald-100 text-emerald-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-red-100 text-red-700';
  }
};

export function LicencePage() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [license, setLicense] = useState<FishingLicenseInfoJson | null>(null);
  const [loading, setLoading] = useState(true);
  // Shown either when the user has no license yet, or when they choose to replace it.
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadLicense = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await licenseApi.getUserLicense(userId);
      setLicense(data);
      setShowUploadForm(false);
    } catch {
      // The server replies 400 ("License not found") when the user has no
      // license yet: treat any failure as "no license" and show the form.
      setLicense(null);
      setShowUploadForm(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLicense();
  }, [loadLicense]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !file) return;
    setUploadError(null);
    setUploading(true);
    try {
      await licenseApi.uploadLicense(userId, file);
      setFile(null);
      // Re-fetch to show the data extracted by the server.
      await loadLicense();
    } catch {
      setUploadError('Errore durante il caricamento. Riprova più tardi.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <NavBar />
      <SpidLock pageName="Licenze">
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
            La tua licenza di pesca
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            Carica e gestisci la tua licenza di pesca.
          </p>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
                style={{ borderTopColor: BRAND }}
              />
            </div>
          )}

          {/* License summary */}
          {!loading && license && !showUploadForm && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-gray-500">Numero licenza</span>
                  <span className="text-sm font-medium text-gray-900">
                    {license.licenseNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-gray-500">Stagione</span>
                  <span className="text-sm font-medium text-gray-900">
                    {license.season}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-gray-500">Scadenza</span>
                  <span className="text-sm font-medium text-gray-900">
                    {license.expirationDate}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-gray-500">Stato</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                      license.status
                    )}`}
                  >
                    {statusLabel(license.status)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/licence/${license.id}`)}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
                  style={{ backgroundColor: BRAND }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND_DARK)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND)
                  }
                >
                  Vai al dettaglio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadError(null);
                    setShowUploadForm(true);
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Sostituisci licenza
                </button>
              </div>
            </div>
          )}

          {/* Upload form */}
          {!loading && showUploadForm && (
            <form
              onSubmit={handleUpload}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
            >
              <label
                htmlFor="license-file"
                className="block text-sm font-medium text-gray-700"
              >
                Carica foto della tua licenza di pesca
              </label>
              <input
                id="license-file"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#1D9E75] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#178a64]"
              />

              {uploadError && (
                <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {uploadError}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? 'Caricamento in corso...' : 'Carica'}
                </button>
                {/* Allow going back to the summary only when a license already exists */}
                {license && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => {
                      setFile(null);
                      setUploadError(null);
                      setShowUploadForm(false);
                    }}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                )}
              </div>
            </form>
          )}
        </main>
      </SpidLock>
    </div>
  );
}
