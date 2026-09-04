import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("smartdesk_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    const { token, userId, name, email: userEmail, role } = res.data;

    localStorage.setItem("smartdesk_token", token);
    const userData = { userId, name, email: userEmail, role };
    localStorage.setItem("smartdesk_user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("smartdesk_token");
    localStorage.removeItem("smartdesk_user");
    setUser(null);
  };

  const updateUser = (changes) => {
    setUser((current) => {
      const updated = { ...current, ...changes };
      localStorage.setItem("smartdesk_user", JSON.stringify(updated));
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