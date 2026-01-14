import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Initialize from localStorage so the UI feels fast
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
    const verifySession = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include", // Essential to send the HttpOnly cookie
        });

        if (!res.ok) throw new Error("Session invalid");

        const data = await res.json();
        console.log("Full Server Response:", data);
        
        // Sync the state with the fresh data from server
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        // If the cookie is expired or missing, clear everything
        console.warn("Auth verification failed:", err.message);
        logout(); 
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [BASE_URL]); // Added BASE_URL as a dependency

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) localStorage.setItem("token", userData.token);
    
    setUser(userData);
  };

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
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);