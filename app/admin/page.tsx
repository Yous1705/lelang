"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuctionForm } from "@/components/auction-form";
import { BiddersManager } from "@/components/bidders-manager";
import { useToast } from "@/hooks/use-toast";
// Remove i18n import as we're using direct Indonesian strings
import type { Auction, Bid, Bidder } from "@/lib/types";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [allBids, setAllBids] = useState<Bid[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [selectedAuctionForBidders, setSelectedAuctionForBidders] =
    useState<Auction | null>(null);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"auctions" | "bids">("auctions");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAuctions();
      fetchAllBids();
    }
  }, [user]);

  async function fetchAuctions() {
    try {
      const response = await fetch("/api/auctions", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    } finally {
      setAuctionsLoading(false);
    }
  }

  async function fetchAllBids() {
    try {
      const response = await fetch("/api/bids");
      if (response.ok) {
        const data = await response.json();
        setAllBids(data);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  }

  async function handleSaveAuction(formData: any) {
    try {
      const url = editingAuction
        ? `/api/auctions/${editingAuction.id}`
        : "/api/auctions";
      const method = editingAuction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "same-origin",
      });

      // Try to parse JSON safely — some endpoints may return empty body
      const contentType = response.headers.get("content-type") || "";
      let respJson: any = null;
      if (contentType.includes("application/json")) {
        try {
          respJson = await response.json();
        } catch (e) {
          // ignore parse errors, leave respJson null
          respJson = null;
        }
      }

      if (!response.ok) {
        // Try to extract error message from JSON if available
        const errMsg =
          respJson && respJson.error
            ? respJson.error
            : response.statusText || "Request failed";
        throw new Error(errMsg as string);
      }

      // If auction created/updated successfully, save any uploaded images to DB
      const auctionId = editingAuction ? editingAuction.id : respJson?.id;

      if (
        formData.images &&
        Array.isArray(formData.images) &&
        formData.images.length > 0
      ) {
        try {
          const filenames = formData.images
            .map((i: any) => i.filename)
            .filter(Boolean);

          if (filenames.length > 0) {
            await fetch("/api/auctions/images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ auctionId, filenames }),
              credentials: "same-origin",
            });
          }
        } catch (err) {
          // Non-fatal: log but continue — auction was created/updated
          console.error("Failed to save auction images:", err);
        }
      }

      setShowForm(false);
      setEditingAuction(null);
      fetchAuctions();
    } catch (error) {
      throw error;
    }
  }

  async function handleDeleteAuction(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus lelang ini?")) return;
    // Optimistic UI update: remove item locally first, but keep a copy to rollback on failure
    const prev = auctions;
    // mark as deleting to disable button
    setDeletingIds((d) => [...d, id]);
    setAuctions((p) => p.filter((a) => a.id !== Number(id)));

    try {
      const response = await fetch(`/api/auctions/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        // rollback optimistic update
        setAuctions(prev);
        // Try to parse a helpful error message from the response. If parsing fails, fall back
        // to statusText or raw text so we don't crash on non-JSON responses.
        const contentType = response.headers.get("content-type") || "";
        let message = response.statusText || "Request failed";

        if (contentType.includes("application/json")) {
          try {
            const err = await response.json();
            message = err?.error || err?.message || message;
          } catch (e) {
            // ignore JSON parse errors
          }
        } else {
          try {
            const txt = await response.text();
            if (txt) message = txt;
          } catch (e) {
            // ignore
          }
        }

        // Log error in development only
        if (process.env.NODE_ENV === "development") {
          console.debug("[Dev] Delete auction failed:", message);
        }

        if (response.status === 401) {
          toast({
            title: "Tidak terautentikasi",
            description: "Anda perlu masuk kembali untuk melakukan aksi ini.",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }

        toast({
          title: "Gagal menghapus",
          description: String(message),
          variant: "destructive",
        });

        return;
      }

      // success — update UI immediately without forcing a full page refresh
      toast({
        title: "Berhasil",
        description: "Lelang berhasil dihapus",
        variant: "default",
      });

      // success — ensure deleting flag cleared
      setDeletingIds((d) => d.filter((x) => x !== id));

      if (process.env.NODE_ENV === "development") {
        try {
          const body = await response.json();
          console.debug("[Dev] Delete response:", response.status, body);
        } catch (e) {
          console.debug("[Dev] Delete response status:", response.status);
        }
      }

      // Refresh in background to ensure state is in sync with the server
      fetchAuctions();
    } catch (error) {
      // Log and show toast with friendly message
      if (process.env.NODE_ENV === "development") {
        console.debug("[Dev] Error deleting auction:", error);
      }
      // rollback optimistic UI and clear deleting flag
      setAuctions(prev);
      setDeletingIds((d) => d.filter((x) => x !== id));
      toast({
        title: "Kesalahan saat menghapus",
        description: String((error as any)?.message || error),
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-foreground-secondary">Memuat...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Panel Admin</h1>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition"
              >
                + Tambah Barang
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {editingAuction ? "Ubah Data Barang" : "Tambah Barang"}
              </h2>
              <AuctionForm
                auction={editingAuction || undefined}
                onSubmit={handleSaveAuction}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAuction(null);
                }}
              />
            </div>
          )}

          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("auctions")}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === "auctions"
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              Daftar Barang ({auctions.length})
            </button>
            <button
              onClick={() => setActiveTab("bids")}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === "bids"
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              Daftar Penawaran ({allBids.length})
            </button>
          </div>

          {activeTab === "auctions" && (
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Nama Barang
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Harga Awal
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Penawaran Tertinggi
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map((auction) => (
                    <tr
                      key={auction.id}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="px-6 py-4 text-foreground font-medium">
                        {auction.title}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(auction.start_price)}
                      </td>
                      <td className="px-6 py-4 text-primary font-semibold">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(auction.highest_bid)}
                      </td>
                      <td className="px-6 py-4 text-foreground-secondary text-sm">
                        {new Date(auction.end_date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingAuction(auction);
                              setShowForm(true);
                            }}
                            className="px-3 py-1 bg-surface border border-border rounded text-sm font-medium text-foreground hover:bg-surface/80"
                          >
                            Ubah
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/auctions/${auction.id}/bidders`,
                                  { credentials: "same-origin" }
                                );
                                if (res.ok) {
                                  const data = await res.json();
                                  setBidders(data || []);
                                  setSelectedAuctionForBidders(auction);
                                } else {
                                  const ct =
                                    res.headers.get("content-type") || "";
                                  let msg = res.statusText || "Failed to load";
                                  if (ct.includes("application/json")) {
                                    try {
                                      const j = await res.json();
                                      msg = j.error || j.message || msg;
                                    } catch (e) {}
                                  } else {
                                    try {
                                      const t = await res.text();
                                      if (t) msg = t;
                                    } catch (e) {}
                                  }
                                  console.error(
                                    "Failed to load bidders for auction",
                                    auction.id,
                                    msg
                                  );
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="px-3 py-1 bg-surface border border-border rounded text-sm font-medium text-foreground hover:bg-surface/80"
                          >
                            Kelola Penawar
                          </button>

                          <button
                            onClick={() => handleDeleteAuction(auction.id)}
                            disabled={deletingIds.includes(auction.id)}
                            aria-busy={deletingIds.includes(auction.id)}
                            className={`px-3 py-1 bg-destructive text-white rounded text-sm font-medium ${
                              deletingIds.includes(auction.id)
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:opacity-90"
                            }`}
                          >
                            {deletingIds.includes(auction.id) ? (
                              <span className="inline-flex items-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  ></path>
                                </svg>
                                <span>Menghapus...</span>
                              </span>
                            ) : (
                              "Hapus"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "bids" && (
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Auction
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Bidder
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Bid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allBids.map((bid) => (
                    <tr
                      key={bid.id}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="px-6 py-4 text-foreground">
                        {(bid as any).title}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {(bid as any).name || (bid as any).email}
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(bid.bid_amount)}
                      </td>
                      <td className="px-6 py-4 text-foreground-secondary text-sm">
                        {new Date(bid.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedAuctionForBidders && (
            <BiddersManager
              auctionId={selectedAuctionForBidders.id}
              bidders={bidders}
              onClose={() => setSelectedAuctionForBidders(null)}
              onUpdate={() => {
                setSelectedAuctionForBidders(null);
                fetchAuctions();
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
