"use client";

import { t } from "@/lib/i18n";
import Logo from "./logo";

export function Footer() {
  return (
    <footer className="bg-surface text-foreground mt-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10 rounded" />
              <div>
                <h3 className="text-lg font-bold">Lelang Internal</h3>
                <p className="text-sm text-foreground-secondary">
                  Platform lelang profesional untuk mengelola dan menawar item
                  dengan transparan.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Tautan</h4>
            <ul className="space-y-2 text-foreground-secondary">
              <li>
                <a href="/" className="hover:text-foreground transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="hover:text-foreground transition-colors"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            <p className="text-sm text-foreground-secondary">
              Email:{" "}
              <a href="mailto:hello@lelang.local" className="underline">
                hello@lelang.local
              </a>
            </p>
            <p className="text-sm text-foreground-secondary">
              Tel: +62 21 1234 5678
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Mitra</h4>
            <div className="flex flex-wrap gap-2 text-sm text-foreground-secondary">
              <span className="px-3 py-1 bg-surface-variant rounded">
                Bank BRI
              </span>
              <span className="px-3 py-1 bg-surface-variant rounded">
                Bank BCA
              </span>
              <span className="px-3 py-1 bg-surface-variant rounded">
                Bank Mandiri
              </span>
              <span className="px-3 py-1 bg-surface-variant rounded">
                Bank BNI
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-foreground-secondary">
            {t("footer.hakCipta")}
          </p>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <a
              href="/privacy"
              className="text-sm text-foreground-secondary hover:text-foreground"
            >
              Privasi
            </a>
            <a
              href="/terms"
              className="text-sm text-foreground-secondary hover:text-foreground"
            >
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
