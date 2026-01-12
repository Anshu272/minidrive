import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🛡️ ProtectedRoute: Redirects to /auth if NOT logged in
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="bg-black min-h-screen text-white p-10">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

// 🚫 GuestRoute: Redirects to /dashboard if ALREADY logged in
export const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="bg-black min-h-screen text-white p-10">Loading...</div>;

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};