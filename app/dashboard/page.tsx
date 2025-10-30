"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AuctionCard } from "@/components/auction-card";
import { BidModal } from "@/components/bid-modal";
import { SearchBar } from "@/components/search-bar";
import { NotificationsPanel } from "@/components/notifications-panel";
import { formatCurrency } from "@/lib/currency";
import type { Auction, Bid } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  // removed myBids table per UX change — keep dashboard focused on auctions
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.log("[Dashboard] Auth state:", { loading, user });
    if (!loading && !user) {
      console.log("[Dashboard] No user found, redirecting to login");
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      console.log("[Dashboard] User authenticated, fetching data");
      fetchAuctions();
    }
  }, [user]);

  async function fetchAuctions() {
    try {
      const response = await fetch("/api/auctions");
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    } finally {
      setAuctionsLoading(false);
    }
  }

  async function handleSearch(
    query: string,
    minPrice?: number,
    maxPrice?: number,
    status?: string
  ) {
    setAuctionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (minPrice !== undefined)
        params.append("minPrice", minPrice.toString());
      if (maxPrice !== undefined)
        params.append("maxPrice", maxPrice.toString());
      if (status) params.append("status", status);

      const response = await fetch(`/api/auctions/search?${params.toString()}`);
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("Error searching auctions:", error);
    } finally {
      setAuctionsLoading(false);
    }
  }

  // fetchMyBids removed — dashboard no longer shows user's bids

  async function handleBidSubmit(amount: number) {
    if (!selectedAuction) return;

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: selectedAuction.id,
          bid_amount: amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setSuccessMessage("Bid placed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchAuctions();
      // no myBids refresh needed
    } catch (error) {
      throw error;
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

  const filteredAuctions = auctions.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar onNotificationsClick={() => setShowNotifications(true)} />
      <main className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Lelang Tersedia
            </h1>
            <SearchBar onSearch={handleSearch} isLoading={auctionsLoading} />
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                images={(auction as any).images}
                onBidClick={setSelectedAuction}
              />
            ))}
          </div>

          {/* Penawaran Saya removed per UX decision */}
        </div>
      </main>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <BidModal
        auction={selectedAuction}
        open={selectedAuction !== null}
        onClose={() => setSelectedAuction(null)}
        onSubmit={handleBidSubmit}
      />
    </>
  );
}
