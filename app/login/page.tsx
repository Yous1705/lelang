"use client"

import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md border border-border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Login</h1>
            <p className="text-foreground-secondary text-center mb-8">Sign in to your account</p>

            <LoginForm />

            <p className="text-center text-foreground-secondary mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>

            <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-foreground-secondary">
                <strong>Demo Admin:</strong> admin@lelang.com / admin123
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
