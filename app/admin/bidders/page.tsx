"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { t } from "@/lib/i18n";

interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  bid_amount: number;
  created_at: string;
  auction_title: string;
  bidder_name: string;
  bidder_email: string;
  bidder_phone: string;
}

export default function AdminBiddersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "name_asc" | "name_desc"
  >("newest");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchBids();
    }
  }, [user, startDate, endDate, sortBy]);

  async function fetchBids() {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/bids?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Failed to fetch bids");
      const data = await response.json();
      setBids(data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const sortedAndFilteredBids = [...bids]
    .filter(
      (bid) =>
        bid.bidder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.auction_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.bidder_email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name_asc":
          return (a.bidder_name || "").localeCompare(b.bidder_name || "");
        case "name_desc":
          return (b.bidder_name || "").localeCompare(a.bidder_name || "");
        default:
          return 0;
      }
    });

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "medium",
    });
  }

  if (loading || isLoading) {
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
              {t("admin.penawar.data")}
            </h1>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2"
                />
                <span>s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2"
              >
                <option value="newest">{t("dashboard.urutkan.terbaru")}</option>
                <option value="oldest">{t("dashboard.urutkan.terlama")}</option>
                <option value="name_asc">
                  {t("dashboard.urutkan.namaAZ")}
                </option>
                <option value="name_desc">
                  {t("dashboard.urutkan.namaZA")}
                </option>
              </select>
              <div className="w-64">
                <input
                  type="text"
                  placeholder="Cari nama/barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      {t("admin.penawar.nama")}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      {t("admin.barang.nama")}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      {t("admin.penawar.jumlah")}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      {t("admin.penawar.tanggal")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedAndFilteredBids.map((bid: Bid) => (
                    <tr
                      key={bid.id}
                      className="hover:bg-surface transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-foreground">
                            {bid.bidder_name}
                          </div>
                          <div className="text-sm text-foreground-secondary">
                            ✉️ {bid.bidder_email}
                          </div>
                          <div className="text-sm text-foreground-secondary">
                            📱 {bid.bidder_phone || "Tidak ada nomor"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">
                        {bid.auction_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                        Rp {bid.bid_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">
                        {formatDateTime(bid.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
