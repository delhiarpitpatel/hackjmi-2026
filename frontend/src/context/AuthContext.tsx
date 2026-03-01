import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, getMe, UserResponse } from "../api/services";
import { clearToken, setToken } from "../api/client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: UserResponse | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (fullName: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      await apiLogin(phone, password);       // sets token in client.ts
      const me = await getMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      await apiRegister(fullName, phone, password);
      const me = await getMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
