"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email dan kata sandi harus diisi");
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        // Clear any existing errors
        setError("");

        // Wait a bit for auth state to fully update
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          router.push("/dashboard");
        } catch (e) {
          // Fallback if router push fails
          window.location.href = "/dashboard";
        }
      } else {
        setError(result.message || "Login gagal: Terjadi kesalahan");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "Login gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Kata Sandi
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 bg-primary text-white rounded-md font-medium 
          ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"} 
          transition-colors flex items-center justify-center`}
      >
        {loading ? "Sedang masuk..." : "Masuk"}
      </button>
    </form>
  );
}
