import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/GuardRoutes"; // Import guards
/* ... keep your other imports ... */
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Upload from "./pages/Upload";
import DashboardLayout from "./pages/Dashboard";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MyDrive from "./pages/MyDrive";
import SharedFile from "./pages/FIle";
import AdminDashboard from "./pages/Admin";


function App() {
  gsap.registerPlugin(ScrollTrigger);

  return (
    <Routes>
      {/* 🌍 Public routes open to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="file/:id" element={<SharedFile />} />

      {/* 🔒 Guest only: If logged in, they get sent to /dashboard */}
      <Route element={<GuestRoute />}>
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* 🔐 Protected: If NOT logged in, they get sent to /auth */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyDrive />} />
          <Route path="upload" element={<Upload />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;