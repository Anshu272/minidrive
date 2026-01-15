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
          credentials: "include", 
        });

        // 1. If everything is fine, update the user data
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } 
        // 2. Only log out if the server EXPLICITLY says the token is invalid (401)
        else if (res.status === 401) {
          console.warn("Session expired on server.");
          logout();
        }
        // 3. If it's a 500 error or Render is sleeping (502/504), 
        // we DO NOTHING. We keep the 'user' from localStorage.

      } catch (err) {
        // 4. If it's a network error (no internet or server down), 
        // we DO NOT call logout(). We keep the UI in logged-in state.
        console.warn("Server unreachable, keeping local session active.");
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