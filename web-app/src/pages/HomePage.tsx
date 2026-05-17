import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();
  const gotToDashboard = () => {
    navigate('/dashboard/login');
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">PermitNow</h1>
      <button
          onClick={gotToDashboard}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Go to admin Dashboard
        </button>
    </div>
  );
}
