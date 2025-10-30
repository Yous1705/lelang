"use client"

import { Navbar } from "@/components/navbar"
import { RegisterForm } from "@/components/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md border border-border p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Register</h1>
            <p className="text-foreground-secondary text-center mb-8">Create a new account</p>

            <RegisterForm />

            <p className="text-center text-foreground-secondary mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
