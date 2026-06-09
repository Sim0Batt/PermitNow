import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { NavBar } from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user';
import type { UserProfileJson } from '../types/models';

const BRAND = '#1D9E75';

const roleLabel = (role: string): string =>
  role === 'admin' ? 'Amministratore' : 'Utente';

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';

export function ProfilePage() {
  const { userId } = useAuth();

  const [profile, setProfile] = useState<UserProfileJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edit-profile form
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Change-password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await userApi.getUser(userId);
      setProfile(data);
      setName(data.name);
      setSurname(data.surname);
      setEmail(data.email);
      setFiscalCode('');
    } catch {
      setLoadError('Impossibile caricare il profilo. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !profile) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      // Verified users may only change their email; name/surname stay as stored
      // and fiscalCode is sent blank so the server leaves it unchanged.
      const payload = profile.verified
        ? { name: profile.name, surname: profile.surname, email, fiscalCode: '' }
        : { name, surname, email, fiscalCode };
      await userApi.updateProfile(userId, payload);
      setProfile({ ...profile, name: payload.name, surname: payload.surname, email });
      setName(payload.name);
      setSurname(payload.surname);
      setFiscalCode('');
      setProfileSuccess('Profilo aggiornato con successo.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Aggiornamento non riuscito. Controlla i dati e riprova.';
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Le nuove password non coincidono.');
      return;
    }
    setSavingPassword(true);
    try {
      await userApi.changePassword(userId, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess('Password aggiornata con successo.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Cambio password non riuscito. Riprova.';
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <NavBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Il tuo profilo
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Gestisci i tuoi dati personali e la tua password.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
              style={{ borderTopColor: BRAND }}
            />
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {!loading && !loadError && profile && (
          <div className="space-y-6">
            {/* Read-only header */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.name} {profile.surname}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {roleLabel(profile.role)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    profile.verified
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {profile.verified ? 'Verificato' : 'Non verificato'}
                </span>
              </div>
            </section>

            {/* Section 1 — Edit profile */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Modifica profilo
              </h2>
              {profile.verified && (
                <p className="mt-1 text-sm text-gray-500">
                  Nome, cognome e codice fiscale sono bloccati dopo la verifica
                  SPID. Puoi modificare solo l'email.
                </p>
              )}

              <form
                onSubmit={handleProfileSubmit}
                className="mt-5 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    disabled={profile.verified}
                    value={profile.verified ? profile.name : name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="surname" className="text-sm font-medium text-gray-700">
                    Cognome
                  </label>
                  <input
                    id="surname"
                    type="text"
                    required
                    disabled={profile.verified}
                    value={profile.verified ? profile.surname : surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {!profile.verified && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="fiscalCode"
                      className="text-sm font-medium text-gray-700"
                    >
                      Codice Fiscale
                    </label>
                    <input
                      id="fiscalCode"
                      type="text"
                      value={fiscalCode}
                      onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                      placeholder="Lascia vuoto per non modificarlo"
                      className={`${inputClass} uppercase`}
                    />
                    <p className="text-xs text-gray-500">
                      Inserisci solo se vuoi aggiornare il codice fiscale
                    </p>
                  </div>
                )}

                {profileError && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {profileSuccess}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProfile ? 'Salvataggio in corso…' : 'Salva modifiche'}
                  </button>
                </div>
              </form>
            </section>

            {/* Section 2 — Change password */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Cambia password</h2>

              <form
                onSubmit={handlePasswordSubmit}
                className="mt-5 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password attuale
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nuova password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmNewPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Conferma nuova password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {passwordError && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#178a64] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingPassword ? 'Aggiornamento in corso…' : 'Aggiorna password'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
