"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { t } from "@/lib/i18n";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">
          {t("beranda.judul")}
        </h1>
        <p className="text-lg text-foreground-secondary mb-8">
          {t("beranda.subjudul")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="btn-primary px-8 py-3 shadow-md hover:shadow-lg"
          >
            {t("auth.masuk")}
          </Link>

          <Link
            href="/register"
            className="btn-secondary px-8 py-3 shadow-sm hover:shadow-md"
          >
            {t("auth.daftar")}
          </Link>
        </div>
      </div>
    </main>
  );
}
