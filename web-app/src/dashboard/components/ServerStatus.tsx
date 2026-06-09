import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export const ServerStatus = () => {
  const [generalStatus, setGeneralStatus] = useState('');
  const [permitStatus, setPermitStatus] = useState('');
  const [licenceStatus, setLicenceStatus] = useState('');
  const [newsStatus, setNewsStatus] = useState('');
  useEffect(() => {
    const fetchStatuses = async () => {
      const response = await apiClient.get('/status');
      if (response.data === 'OK') {
        setGeneralStatus('OK');
      } else {
        setGeneralStatus('FA');
      }

      // const permitRsponse = await apiClient.get('/status/permit');
      // if (permitRsponse.data != 'FA') {
      //   setPermitStatus('OK');
      // } else {
      //   setPermitStatus('FA');
      // }
      setPermitStatus("FA")

      const licenceResponse = await apiClient.get('/status/license');
      if (licenceResponse.data != 'FA') {
        setLicenceStatus('OK');
      } else {
        setLicenceStatus('FA');
      }

      // const newsResponse = await apiClient.get('/status/news');
      // if (newsResponse.data != 'FA') {
      //   setNewsStatus('OK');
      // } else {
      //   setNewsStatus('FA');
      // }
    setNewsStatus("FA")

    };

    fetchStatuses();

    const interval = setInterval(fetchStatuses, 5000);

    return () => clearInterval(interval);
  });

  return (
    <div className="border-2 rounded-sm">
      <h1 className="text-blue-600 text-3xl pt-5 px-5 font-bold">
        Status dei Servizi
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 w-full mt-6">
        <span className="flex flex-col flex-wrap items-start gap-4 w-full ">
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Main Server</h1>
            {generalStatus === 'OK' ? (
              <label className="text-green-500 text-2xl">{generalStatus}</label>
            ) : (
              <label className="text-red-500 text-2xl">{generalStatus}</label>
            )}
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Servizio Permessi</h1>
            {permitStatus === 'OK' ? (
              <label className="text-green-500 text-2xl">{permitStatus}</label>
            ) : (
              <label className="text-red-500 text-2xl">{permitStatus}</label>
            )}
          </div>
        </span>
        <span className="flex flex-col flex-wrap items-start gap-4 w-full ">
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Servizio Licenze</h1>
            {licenceStatus === 'OK' ? (
              <label className="text-green-500 text-2xl">{licenceStatus}</label>
            ) : (
              <label className="text-red-500 text-2xl">{licenceStatus}</label>
            )}
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-blue-300 text-2xl">Servizio Notizie</h1>
            {newsStatus === 'OK' ? (
              <label className="text-green-500 text-2xl">{newsStatus}</label>
            ) : (
              <label className="text-red-500 text-2xl">{newsStatus}</label>
            )}
          </div>
        </span>
      </div>
    </div>
  );
};
