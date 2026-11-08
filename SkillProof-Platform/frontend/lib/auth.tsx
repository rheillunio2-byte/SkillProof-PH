"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, tokenStore } from "./api";
import type { Role, User } from "./types";

type RegisterInput = { name: string; email: string; password: string; role: Role };
type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api<User>("/api/auth/me")
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener("sp-unauthorized", logout);
    return () => window.removeEventListener("sp-unauthorized", logout);
  }, [logout]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      logout,
      setUser,
      login: async (email, password) => {
        const r = await api<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: { email, password } });
        tokenStore.set(r.token);
        setUser(r.user);
        return r.user;
      },
      register: async (input) => {
        const r = await api<{ token: string; user: User }>("/api/auth/register", { method: "POST", body: input });
        tokenStore.set(r.token);
        setUser(r.user);
        return r.user;
      },
    }),
    [user, loading, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
