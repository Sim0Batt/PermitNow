import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import DashboardHomePage from './dashboard/DashboardHomePage';
import { DashboardLoginPage } from './dashboard/pages/DashboardLoginPage';
import { UserManagementPage } from './dashboard/pages/user/UserManagementPage';
import { UserInfoPage } from './dashboard/pages/user/UserInfoPage';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard/login',
    element: <DashboardLoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardHomePage />,
      },
      {
        path: '/dashboard/user',
        element: <UserManagementPage />,
      },
      {
        path: '/dashboard/user/:id',
        element: <UserInfoPage />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
