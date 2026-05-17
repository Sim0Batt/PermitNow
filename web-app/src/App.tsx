import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import DashboardHomePage from './dashboard/DashboardHomePage';
import { UserManagementPage } from './dashboard/pages/user/UserManagementPage';
import { UserInfoPage } from './dashboard/pages/user/UserInfoPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
