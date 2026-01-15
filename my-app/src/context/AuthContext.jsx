import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Keep your fast UI hydration
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          if (!cancelled) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } 
        // ONLY logout if server explicitly says UNAUTHORIZED
        else if (res.status === 401) {
          if (!cancelled) {
            setUser(null);
            localStorage.removeItem("user");
          }
        }
        // Any other status → ignore (Render sleep, temp error)

      } catch {
        // Network error → keep local session
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [BASE_URL]);

  // Keep same signature
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData?.token) {
      localStorage.setItem("token", userData.token);
    }
    setUser(userData);
  };

  // Keep same signature
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
