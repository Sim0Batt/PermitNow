import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { NavBar } from '../components/NavBar';
import { SpidLock } from '../components/SpidLock';
import { useAuth } from '../context/AuthContext';
import { bookApi } from '../api/book';
import type { FishingPage, FishingRow } from '../types/models';

interface RowFormData {
  fishName: string;
  zone: string;
  specie: string;
  measure: number;
}

const BRAND = '#1D9E75';

const FISH_NAMES = [
  'Trota fario',
  'Trota marmorata',
  'Ibrido di trota (marmorata x fario)',
  'Trota iridea',
  'Salmerino alpino',
  'Salmerino fontinalis',
  'Coregone (Lavarello)',
  'Temolo',
  'Luccio',
  'Pesce persico',
  'Carpa',
  'Tinca',
  'Anguilla',
  'Cavedano',
  'Scardola',
  'Alborella',
  'Barbo',
  'Cagnetta',
  'Luccioperca (Sandra)',
  'Persico trota (Black bass)',
];

const emptyRowForm: RowFormData = { fishName: '', zone: '', specie: '', measure: 0 };

export function FishingBookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { userId } = useAuth();
  const [pages, setPages] = useState<FishingPage[]>([]);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [rowsByPage, setRowsByPage] = useState<Record<string, FishingRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingRow, setAddingRow] = useState<string | null>(null);
  const [rowForm, setRowForm] = useState<RowFormData>(emptyRowForm);

  const fetchPages = useCallback(() => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    bookApi
      .getPages(bookId)
      .then(setPages)
      .catch(() => setError('Impossibile caricare le pagine del libretto.'))
      .finally(() => setLoading(false));
  }, [bookId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const togglePage = (pageId: string) => {
    if (expandedPageId === pageId) {
      setExpandedPageId(null);
      return;
    }
    setExpandedPageId(pageId);
    if (!rowsByPage[pageId]) {
      bookApi.getRows(pageId).then((rows) => {
        setRowsByPage((prev) => ({ ...prev, [pageId]: rows }));
      });
    }
  };

  const handleCreatePage = async () => {
    if (!userId) return;
    try {
      await bookApi.createPage(userId);
      fetchPages();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setError('Non puoi creare più pagine per lo stesso giorno.');
      } else {
        setError('Errore nella creazione della pagina.');
      }
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa pagina?')) return;
    try {
      await bookApi.deletePage(pageId);
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      if (expandedPageId === pageId) setExpandedPageId(null);
    } catch {
      setError('Errore nella cancellazione della pagina.');
    }
  };

  const handleAddRow = async (pageId: string) => {
    try {
      await bookApi.addRow(pageId, rowForm);
      const rows = await bookApi.getRows(pageId);
      setRowsByPage((prev) => ({ ...prev, [pageId]: rows }));
      setAddingRow(null);
      setRowForm(emptyRowForm);
    } catch {
      setError('Errore nell\'aggiunta del record.');
    }
  };

  const handleDeleteRow = async (rowId: string, pageId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo record?')) return;
    try {
      await bookApi.deleteRow(rowId);
      setRowsByPage((prev) => ({
        ...prev,
        [pageId]: (prev[pageId] ?? []).filter((r) => r.id !== rowId),
      }));
    } catch {
      setError('Errore nella cancellazione del record.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <NavBar />
      <SpidLock pageName="Libretto di Pesca">
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          <Link
            to="/wallet"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Torna al Wallet
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Libretto di Pesca
              </h1>
              <p className="text-sm text-gray-500">Codice: {bookId}</p>
            </div>
            <button
              onClick={handleCreatePage}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
              style={{ backgroundColor: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#178a64')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
            >
              + Nuova Pagina
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
                style={{ borderTopColor: BRAND }}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 mb-4">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>
          )}

          {!loading && pages.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Nessuna pagina nel libretto</p>
              <p className="text-sm mt-1">Crea una nuova pagina per iniziare a registrare le catture.</p>
            </div>
          )}

          {!loading && pages.length > 0 && (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Page header */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => togglePage(page.id)}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 text-gray-400 transition-transform ${expandedPageId === page.id ? 'rotate-90' : ''}`}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{page.date}</p>
                        <p className="text-xs text-gray-400">ID: {page.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Elimina
                    </button>
                  </div>

                  {/* Expanded rows */}
                  {expandedPageId === page.id && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                      {!rowsByPage[page.id] ? (
                        <div className="flex justify-center py-4">
                          <div
                            className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200"
                            style={{ borderTopColor: BRAND }}
                          />
                        </div>
                      ) : rowsByPage[page.id].length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">
                          Nessun record in questa pagina.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {rowsByPage[page.id].map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center justify-between rounded-lg bg-white border border-gray-100 px-4 py-3"
                            >
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1 flex-1">
                                <div>
                                  <span className="text-xs text-gray-400">Pesce</span>
                                  <p className="text-sm font-medium text-gray-900">{row.fishName}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">Specie</span>
                                  <p className="text-sm font-medium text-gray-900">{row.specie}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">Zona</span>
                                  <p className="text-sm font-medium text-gray-900">{row.zone}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">Misura</span>
                                  <p className="text-sm font-medium text-gray-900">{row.measure} cm</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteRow(row.id, page.id)}
                                className="ml-3 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add row form */}
                      {addingRow === page.id ? (
                        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-600">Nome pesce</label>
                              <select
                                value={rowForm.fishName}
                                onChange={(e) => setRowForm({ ...rowForm, fishName: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              >
                                <option value="">Seleziona...</option>
                                {FISH_NAMES.map((name) => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Specie</label>
                              <select
                                value={rowForm.specie}
                                onChange={(e) => setRowForm({ ...rowForm, specie: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              >
                                <option value="">Seleziona...</option>
                                <option value="Maschio">Maschio</option>
                                <option value="Femmina">Femmina</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Zona</label>
                              <input
                                type="text"
                                value={rowForm.zone}
                                onChange={(e) => setRowForm({ ...rowForm, zone: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Misura (cm)</label>
                              <input
                                type="number"
                                value={rowForm.measure}
                                onChange={(e) => setRowForm({ ...rowForm, measure: parseFloat(e.target.value) || 0 })}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setAddingRow(null);
                                setRowForm(emptyRowForm);
                              }}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              Annulla
                            </button>
                            <button
                              onClick={() => handleAddRow(page.id)}
                              disabled={!rowForm.fishName || !rowForm.zone || !rowForm.specie || rowForm.measure <= 0}
                              className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: BRAND }}
                            >
                              Salva
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingRow(page.id)}
                          className="mt-3 w-full rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                        >
                          + Aggiungi record
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </SpidLock>
    </div>
  );
}
