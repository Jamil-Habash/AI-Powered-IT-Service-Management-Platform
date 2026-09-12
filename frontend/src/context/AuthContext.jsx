import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext(null);

function getStoredSession() {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem("smartdesk_token");
    const user = storage.getItem("smartdesk_user");
    if (token && user) {
      return { token, user: JSON.parse(user) };
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return getStoredSession()?.user || null;
  });

  const login = async (email, password, rememberMe) => {
    const res = await loginUser(email, password);
    const { token, userId, name, email: userEmail, role } = res.data;

    const userData = { userId, name, email: userEmail, role };
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    storage.setItem("smartdesk_token", token);
    storage.setItem("smartdesk_user", JSON.stringify(userData));
    otherStorage.removeItem("smartdesk_token");
    otherStorage.removeItem("smartdesk_user");
    localStorage.setItem("smartdesk_remember_me", String(rememberMe));
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("smartdesk_token");
    localStorage.removeItem("smartdesk_user");
    sessionStorage.removeItem("smartdesk_token");
    sessionStorage.removeItem("smartdesk_user");
    setUser(null);
  };

  const updateUser = (changes) => {
    setUser((current) => {
      const updated = { ...current, ...changes };
      const storage = localStorage.getItem("smartdesk_token")
        ? localStorage
        : sessionStorage;
      storage.setItem("smartdesk_user", JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = (userData) => {
    setUser((current) => {
      const updated = { ...current, ...userData };
      const storage = localStorage.getItem("smartdesk_token")
        ? localStorage
        : sessionStorage;
      storage.setItem("smartdesk_user", JSON.stringify(updated));
      return updated;
    });
  };

  const refreshSession = (sessionData) => {
    const storage = localStorage.getItem("smartdesk_token")
      ? localStorage
      : sessionStorage;
    const updated = {
      userId: sessionData.userId,
      name: sessionData.name,
      email: sessionData.email,
      role: sessionData.role,
    };
    storage.setItem("smartdesk_token", sessionData.token);
    storage.setItem("smartdesk_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);