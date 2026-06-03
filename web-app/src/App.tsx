import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WalletPage } from './pages/WalletPage';
import { LicencePage } from './pages/LicencePage';
import { LicenseDetailPage } from './pages/LicenseDetailPage';
import { FishingBookPage } from './pages/FishingBookPage';
import { PermitsPage } from './pages/PermitsPage';
import { RegisterPlaceholderPage } from './pages/RegisterPage';
import DashboardHomePage from './dashboard/DashboardHomePage';
import { DashboardLoginPage } from './dashboard/pages/DashboardLoginPage';
import { UserManagementPage } from './dashboard/pages/user/UserManagementPage';
import { UserInfoPage } from './dashboard/pages/user/UserInfoPage';
import { NewUserPage } from './dashboard/pages/user/NewUserPage';
import { LicenseManagementPage } from './dashboard/pages/license/LicenseManagementPage';
import { LicenseInfoPage } from './dashboard/pages/license/LicenseInfoPage';
import { NewLicensePage } from './dashboard/pages/license/NewLicensePage';
import { EditLicensePage } from './dashboard/pages/license/EditLicensePage';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  // TODO(auth): replace with real login/register pages (issues #43, #44)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPlaceholderPage />,
  },
  {
    element: <RequireAuth role="user" />,
    children: [
      {
        path: '/wallet',
        element: <WalletPage />,
      },
      {
        path: '/licence/:id',
        element: <LicenseDetailPage />,
      },
      {
        path: '/book/:bookId',
        element: <FishingBookPage />,
      },
      {
        path: '/licence',
        element: <LicencePage />,
      },
      {
        path: '/permits',
        element: <PermitsPage />,
      },
    ],
  },
  {
    path: '/dashboard/login',
    element: <DashboardLoginPage />,
  },
  {
    element: <RequireAuth role="admin" />,
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
        path: '/dashboard/licenses',
        element: <LicenseManagementPage />,
      },
      {
        path: '/dashboard/licenses/:userId',
        element: <LicenseInfoPage />,
      },
      {
        path: '/dashboard/licenses/:userId/create',
        element: <NewLicensePage />,
      },
      {
        path: '/dashboard/licenses/:userId/edit',
        element: <EditLicensePage />,
      },
      {
        path: '/dashboard/users/create',
        element: <NewUserPage />,
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
