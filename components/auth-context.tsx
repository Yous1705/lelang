"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  role: "user" | "admin";
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log("Attempting login...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        return { success: false, message: data.message || "Login gagal" };
      }

      const authCheck = await fetch("/api/auth/me");
      if (!authCheck.ok) {
        return { success: false, message: "Gagal mendapatkan data user" };
      }

      const userData = await authCheck.json();
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Login gagal. Silakan coba lagi.",
      };
    }
  }

  async function register(
    name: string,
    email: string,
    password: string,
    phone: string
  ) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    await checkAuth();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
