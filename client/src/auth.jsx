import { createContext, useContext, useMemo, useState } from "react";
import api from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("jobtracker_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  async function register(data) {
    const response = await api.post("/auth/register", data);
    saveSession(response.data);
    return response.data;
  }

  async function login(data) {
    const response = await api.post("/auth/login", data);
    saveSession(response.data);
    return response.data;
  }

  function saveSession(data) {
    localStorage.setItem("jobtracker_token", data.token);
    const safeUser = { id: data.id, name: data.name, email: data.email };
    localStorage.setItem("jobtracker_user", JSON.stringify(safeUser));
    setUser(safeUser);
  }

  function logout() {
    localStorage.removeItem("jobtracker_token");
    localStorage.removeItem("jobtracker_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, register, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
