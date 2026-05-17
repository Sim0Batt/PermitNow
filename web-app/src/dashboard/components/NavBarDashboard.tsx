import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NavBarDashboard = () => {
  const links: Record<string, string> = {
    Dashboard: '/dashboard',
    'Gestione Licenze': '/dashboard/licenses',
    'Gestione Permessi': '/dashboard/permits',
    'Gestione Utenti': '/dashboard/user',
  };

  const navigate = useNavigate();
  const goToPage = (componentName: string) => {
    navigate(componentName);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="text-lg font-bold text-gray-900">
          PermitNow Admin Dashboard
        </div>

        <ul className="m-0 flex list-none items-center gap-5 p-0 font-medium text-gray-700">
          {Object.keys(links).map((item) => (
            <li
              key={item}
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              <button onClick={() => goToPage(links[item])}>{item}</button>
            </li>
          ))}
        </ul>

        {/* <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:bg-blue-700"
        >
          Nuova richiesta
        </button> */}
      </nav>
    </header>
  );
};
