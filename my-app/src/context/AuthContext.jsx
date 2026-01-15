import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";


  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  let cancelled = false;

  const verifySession = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 ONLY logout on 401
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!cancelled) setUser(null);
        return;
      }

      // Other errors (server down, cold start) → keep session
      if (!res.ok) {
        return;
      }

      const data = await res.json();

      if (!cancelled) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch {
      // 🔥 Network error → DO NOT logout
      // Keep user logged in
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  verifySession();

  return () => {
    cancelled = true;
  };
}, [BASE_URL]);


  const login = ({ user, token }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
