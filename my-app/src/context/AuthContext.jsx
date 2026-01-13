// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  
  // ✅ ADD LOADING STATE
  const [loading, setLoading] = useState(true);

  // ✅ CHECK COOKIE ON APP LOAD
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("No valid session");
        }

        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        // ❌ cookie missing or expired → clear frontend
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        // ✅ Always set loading to false after verification
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);