import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';

interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (userId: string) => void;
  logout: () => Promise<void>;
}

const STORAGE_KEY = 'admin_user_id';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );

  const login = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setUserId(id);
  };

  const logout = async () => {
    // Best-effort server call; ignore failures since logout is purely client-side
    try {
      await authApi.logout();
    } catch {
      // Intentionally ignored: clearing local auth state must always succeed
    }
    localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ userId, isAuthenticated: userId !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
