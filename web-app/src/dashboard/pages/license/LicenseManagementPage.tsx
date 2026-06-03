import { NavBarDashboard } from '../../components/NavBarDashboard';
import { LicenseScrollableList } from '../../components/LicenseScrollableList';

export const LicenseManagementPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBarDashboard />
      <div className="p-10">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Licenze</h1>
      </div>
      <div className="flex-1 p-10">
        <LicenseScrollableList limit={0} />
      </div>
    </div>
  );
};
