// components/GuardRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🛡️ ProtectedRoute: Redirects to /auth if NOT logged in
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
            Verifying_Session...
          </p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

// 🚫 GuestRoute: Redirects to /dashboard if ALREADY logged in
export const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};