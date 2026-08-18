import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bsp_token");
    if (stored) {
      setAuthToken(stored);
      api
        .me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("bsp_token");
          setAuthToken(null);
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  async function login(email, password) {
    const { token, user } = await api.login(email, password);
    localStorage.setItem("bsp_token", token);
    setAuthToken(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("bsp_token");
    setAuthToken(null);
    setUser(null);
  }

  async function updateProfile(data) {
    const updated = await api.updateMe(data);
    setUser(updated);
    return updated;
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
