"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { t } from "@/lib/i18n";
import Link from "next/link";

interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  bid_amount: number;
  created_at: string;
  auction_title: string;
  auction_status: "active" | "ended";
  highest_bid: number;
}

export default function BidHistoryPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">(
    "all"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (user) {
      fetchBids();
    }
  }, [user, startDate, endDate]);

  async function fetchBids() {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    try {
      const response = await fetch(`/api/bids/history?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Failed to fetch bid history");
      const data = await response.json();
      setBids(data);
    } catch (error) {
      console.error("Error fetching bid history:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-foreground-secondary">{t("umum.memuat")}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Riwayat Penawaran
            </h1>
            <div className="flex gap-4">
              <div className="w-64">
                <input
                  type="text"
                  placeholder="Cari nama barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span>s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "active" | "ended")
                }
                className="px-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="ended">Berakhir</option>
              </select>
            </div>
          </div>

          {bids.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-border p-8 text-center">
              <p className="text-foreground-secondary">
                Anda belum melakukan penawaran
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids
                .filter(
                  (bid) =>
                    bid.auction_title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) &&
                    (statusFilter === "all" ||
                      bid.auction_status === statusFilter)
                )
                .map((bid) => (
                  <Link
                    key={bid.id}
                    href={`/detail/${bid.auction_id}`}
                    className="block"
                  >
                    <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {bid.auction_title}
                          </h3>
                          <p className="text-sm text-foreground-secondary mb-4">
                            {formatDateTime(bid.created_at)}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${
                            bid.auction_status === "active"
                              ? "bg-primary/10 text-primary"
                              : "bg-foreground-secondary/10 text-foreground-secondary"
                          }`}
                        >
                          {bid.auction_status === "active"
                            ? t("dashboard.filter.aktif")
                            : t("dashboard.filter.selesai")}
                        </div>
                      </div>

                      <div className="flex gap-8">
                        <div>
                          <p className="text-sm text-foreground-secondary">
                            {t("lelang.penawaran.nominal")}
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            Rp {bid.bid_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-foreground-secondary">
                            {t("lelang.penawaranTertinggi")}
                          </p>
                          <p
                            className={`text-lg font-semibold ${
                              bid.bid_amount === bid.highest_bid
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            Rp {bid.highest_bid.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
