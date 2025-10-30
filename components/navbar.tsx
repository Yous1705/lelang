"use client";

import Link from "next/link";
import { useAuth } from "./auth-context";
import { useState } from "react";
import { t } from "@/lib/i18n";
import Logo from "./logo";

interface NavbarProps {
  onNotificationsClick?: () => void;
}

export function Navbar({ onNotificationsClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-8 w-8 rounded" />
            <span className="text-xl sm:text-2xl font-bold">
              Lelang Internal
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <span className="text-sm">{user.email}</span>
                {onNotificationsClick && (
                  <button
                    onClick={onNotificationsClick}
                    className="hover:text-blue-100 transition text-lg"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </button>
                )}
                {user.role === "admin" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="hover:text-blue-100 transition"
                    >
                      Beranda
                    </Link>
                    <Link
                      href="/admin"
                      className="hover:text-blue-100 transition"
                    >
                      Panel Admin
                    </Link>
                    <Link
                      href="/admin/bidders"
                      className="hover:text-blue-100 transition"
                    >
                      Data Penawar
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="hover:text-blue-100 transition"
                    >
                      Beranda
                    </Link>
                    <Link
                      href="/history"
                      className="hover:text-blue-100 transition"
                    >
                      Riwayat Penawaran
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="hover:text-blue-100 transition"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-blue-100 transition">
                  {t("navigasi.masuk")}
                </Link>
                <Link href="/register" className="btn-primary ml-2">
                  {t("navigasi.daftar")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-blue-100 transition"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 border-t border-blue-400 pt-4">
            {user ? (
              <>
                <div className="text-sm px-2">{user.email}</div>
                {onNotificationsClick && (
                  <button
                    onClick={() => {
                      onNotificationsClick();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-2 py-2 hover:bg-blue-600 rounded transition"
                  >
                    Notifications
                  </button>
                )}
                {user.role === "admin" && (
                  <>
                    <Link
                      href="/admin"
                      className="block px-2 py-2 hover:bg-blue-600 rounded transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/bidders"
                      className="block px-2 py-2 hover:bg-blue-600 rounded transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("navigasi.dataPenawar")}
                    </Link>
                  </>
                )}
                <Link
                  href="/dashboard"
                  className="block px-2 py-2 hover:bg-blue-600 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("navigasi.dashboard")}
                </Link>
                <Link
                  href="/history"
                  className="block px-2 py-2 hover:bg-blue-600 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Riwayat Penawaran
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-2 py-2 hover:bg-blue-600 rounded transition"
                >
                  {t("navigasi.keluar")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-2 py-2 hover:bg-blue-600 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-2 py-2 hover:bg-blue-600 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
