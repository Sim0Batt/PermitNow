import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';

type Role = 'admin' | 'user';

interface AuthState {
  userId: string | null;
  role: Role | null;
  verified: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  loginAdmin: (userId: string) => void;
  loginUser: (userId: string, verified: boolean) => void;
  logout: () => Promise<void>;
}

interface StoredAuth {
  userId: string;
  role: Role;
  verified: boolean;
}

const STORAGE_KEY = 'auth';
const LEGACY_ADMIN_KEY = 'admin_user_id';

const AuthContext = createContext<AuthContextType | null>(null);

function readInitial(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  }
  // Backward compat: silently migrate legacy admin key
  const legacyAdminId = localStorage.getItem(LEGACY_ADMIN_KEY);
  if (legacyAdminId) {
    const migrated: StoredAuth = {
      userId: legacyAdminId,
      role: 'admin',
      verified: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_ADMIN_KEY);
    return migrated;
  }
  return null;
}

// TODO(auth): re-fetch verified from /me endpoint once server implements it
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = useState<StoredAuth | null>(readInitial);

  const persist = (next: StoredAuth | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStored(next);
  };

  const loginAdmin = (userId: string) => {
    persist({ userId, role: 'admin', verified: false });
  };

  const loginUser = (userId: string, verified: boolean) => {
    persist({ userId, role: 'user', verified });
  };

  const logout = async () => {
    // Best-effort server call; ignore failures since logout is purely client-side
    try {
      await authApi.logout();
    } catch {
      // Intentionally ignored: clearing local auth state must always succeed
    }
    persist(null);
  };

  const value: AuthContextType = {
    userId: stored?.userId ?? null,
    role: stored?.role ?? null,
    verified: stored?.verified ?? false,
    isAuthenticated: stored !== null,
    loginAdmin,
    loginUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
