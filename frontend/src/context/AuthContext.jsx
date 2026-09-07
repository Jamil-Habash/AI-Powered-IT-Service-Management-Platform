import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext(null);

function getStoredValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredValue("smartdesk_user");
    return stored ? JSON.parse(stored) : null;
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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);