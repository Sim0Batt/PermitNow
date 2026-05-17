import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export const ServerNumbers = () => {
  const [permitStatus, setPermitStatus] = useState('FA');
  const [licenceStatus, setLicenceStatus] = useState('FA');
  const [newsStatus, setNewsStatus] = useState('FA');
  const [userStatus, setUserStatus] = useState('FA');
  useEffect(() => {
    const fetchStatuses = async () => {
      const permitResponse = await apiClient.get('/status/permit');
      if (permitResponse.data != 'FA') {
        setPermitStatus(permitResponse.data);
      } else {
        setPermitStatus('FA');
      }

      const licenceResponse = await apiClient.get('/status/license');
      if (licenceResponse.data != 'FA') {
        setLicenceStatus(licenceResponse.data);
      } else {
        setLicenceStatus('FA');
      }

      const newsResponse = await apiClient.get('/status/news');
      if (newsResponse.data != 'FA') {
        setNewsStatus(newsResponse.data);
      } else {
        setNewsStatus('FA');
      }

      const userResponse = await apiClient.get('/status/user');
      if (userResponse.data != 'FA') {
        setUserStatus(userResponse.data);
      } else {
        setUserStatus('FA');
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-2 rounded-sm">
      <h1 className="text-blue-600 text-3xl pt-5 px-5 font-bold">
        Numeri dei Servizi
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 w-full mt-6">
        <span className="flex flex-col flex-wrap items-start gap-4 w-full ">
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Utenti Attivi</h1>
            <label className="text-green-500 text-2xl">{userStatus}</label>
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Permessi Attivi</h1>
            <label className="text-green-500 text-2xl">{permitStatus}</label>
          </div>
        </span>
        <span className="flex flex-col flex-wrap items-start gap-4 w-full ">
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Licenze Attive</h1>
            <label className="text-green-500 text-2xl">{licenceStatus}</label>
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Notizie Attive</h1>
            <label className="text-green-500 text-2xl">{newsStatus}</label>
          </div>
        </span>
      </div>
    </div>
  );
};
