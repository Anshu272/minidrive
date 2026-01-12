import { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { 
  FolderOpen, 
  CloudUpload, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  LayoutGrid,
  Menu,
  X
} from "lucide-react";
import { Modal } from "../components/Modal"; 

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", 
      });
    } catch (err) {
      console.error("Backend logout failed", err);
    } finally {
      localStorage.clear();
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      window.location.href = "/auth";
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
      isActive
        ? "bg-yellow-400 text-black font-bold shadow-[0_10px_20px_-5px_rgba(250,204,21,0.3)]"
        : "text-zinc-500 hover:text-white hover:bg-white/5"
    }`;

  const NavigationContent = () => (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Storage</p>
          <nav className="flex flex-col gap-2">
            <NavLink to="/dashboard" end className={navItemClass} onClick={() => setIsMobileMenuOpen(false)}>
              <FolderOpen size={20} />
              <span>My Vault</span>
            </NavLink>

            <NavLink to="/dashboard/upload" className={navItemClass} onClick={() => setIsMobileMenuOpen(false)}>
              <CloudUpload size={20} />
              <span>Upload Files</span>
            </NavLink>
          </nav>
        </div>

        {user?.role === "admin" && (
          <div>
            <p className="px-4 text-[10px] font-black text-red-900 uppercase tracking-[0.2em] mb-4">System</p>
            <nav>
              <NavLink 
                to="/dashboard/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                    isActive
                      ? "bg-red-500 border-red-500 text-white font-bold shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]"
                      : "border-red-500/20 text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
                  }`
                }
              >
                <ShieldCheck size={20} />
                <span>Admin Panel</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-6">
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsLogoutModalOpen(true);
          }} 
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group text-left"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium cursor-pointer">Sign Out</span>
        </button>

        <div className="p-4 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
            <UserIcon size={18} className="text-yellow-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.username || 'Guest'}</p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-tighter">{user?.role || 'Member'}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#050505] text-white overflow-hidden">
      
      <Modal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out"
        description="Are you sure you want to log out?"
        confirmText="Sign Out"
        onConfirm={confirmLogout}
        danger={true}
        loading={isLoggingOut}
      />

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-white/5 px-6 flex items-center justify-between z-[100]">
        <Link to="/" className="flex items-center gap-2">
          <LayoutGrid size={18} className="text-yellow-400" />
          <span className="font-black text-sm uppercase italic tracking-tighter">Mini<span className="text-yellow-400">Drive</span></span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[140] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR DRAWER */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-[#0a0a0a] z-[150] p-8 flex flex-col transition-transform duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <span className="font-black italic uppercase">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-zinc-500" /></button>
        </div>
        <NavigationContent />
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 px-6 py-10 hidden md:flex flex-col relative shrink-0">
        <Link to="/" className="flex items-center gap-3 px-4 mb-12 group">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:scale-110 transition-transform">
            <LayoutGrid size={22} className="text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Mini<span className="text-yellow-400">Drive</span></span>
        </Link>
        <NavigationContent />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}