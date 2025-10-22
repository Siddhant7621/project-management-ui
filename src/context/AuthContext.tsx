import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import type { User, AuthContextType } from "../types";
import toast from "react-hot-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch user from backend if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await api.get("/auth/me", {
            headers: { Authorization: storedToken }, // or Bearer if your backend expects that
          });
          setUser(response.data);
          console.log("user", response.data.user);

          setToken(storedToken);
        } catch (error) {
          console.error("Error fetching user info:", error);
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // 🟩 LOGIN
  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  // 🟦 REGISTER
  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  // 🔴 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
