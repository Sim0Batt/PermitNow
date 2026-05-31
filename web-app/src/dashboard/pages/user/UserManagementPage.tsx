import React from 'react';
import { UserScrollableList } from '../../components/UserScrollableList';
import { useNavigate } from 'react-router-dom';
import { NavBarDashboard } from '../../components/NavBarDashboard';

export const UserManagementPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10">
        <button
          onClick={() => navigate('/dashboard/users/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Nuovo utente
        </button>
      </div>
      <div className="flex-1 p-10">
        <UserScrollableList limit={0} />
      </div>
    </div>
  );
};
