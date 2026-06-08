import { useNavigate } from 'react-router-dom';
import { NavBarDashboard } from '../../components/NavBarDashboard';
import { PermitScrollableList } from '../../components/PermitScrollableList';

export const PermitManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Permessi</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard/permits/create')}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Nuovo permesso
        </button>
      </div>
      <div className="flex-1 p-10">
        <PermitScrollableList limit={0} />
      </div>
    </div>
  );
};
