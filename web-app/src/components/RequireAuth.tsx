import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RequireAuthProps {
  role?: 'admin' | 'user';
}

export const RequireAuth = ({ role }: RequireAuthProps) => {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated || (role && currentRole !== role)) {
    const redirectTo = role === 'user' ? '/login' : '/dashboard/login';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
