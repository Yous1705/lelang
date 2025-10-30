"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ImageCarousel } from "@/components/image-carousel";
import { CountdownTimer } from "@/components/countdown-timer";
import { BidModal } from "@/components/bid-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import type { Auction, AuctionImage, Bidder } from "@/lib/types";

export default function AuctionDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [images, setImages] = useState<AuctionImage[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    async function fetchAuctionDetail() {
      try {
        const response = await fetch(`/api/auctions/${params.id}/detail`);
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setAuction(data.auction);
        setImages(data.images || []);
        // server returns recent bids as `bidders` in the detail payload
        setBidders(data.bidders || []);
      } catch (error) {
        console.error("Error fetching auction:", error);
        toast({
          title: "Kesalahan",
          description: "Gagal memuat detail lelang",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAuctionDetail();
  }, [params.id, toast]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <p className="text-center text-foreground-secondary">Memuat...</p>
          </div>
        </main>
      </>
    );
  }

  if (!auction) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <p className="text-center text-foreground-secondary">
              Lelang tidak ditemukan
            </p>
          </div>
        </main>
      </>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isAuctionEnded = new Date(auction.end_date) < new Date();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Images */}
            <div>
              <ImageCarousel images={images} />
            </div>

            {/* Right: Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {auction.title}
                </h1>
                <p className="text-foreground-secondary">
                  {auction.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-surface rounded-lg p-4 space-y-3 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-foreground-secondary">Harga Awal:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(auction.start_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-3">
                  <span className="text-foreground-secondary">
                    Penawaran Tertinggi:
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(auction.highest_bid)}
                  </span>
                </div>
              </div>

              {/* Back Button */}
              <div className="mb-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-surface/80 transition-colors"
                >
                  ← Kembali
                </Link>
              </div>

              {/* Latest Bids */}
              <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden mb-4">
                <h3 className="text-lg font-semibold p-4 border-b border-border">
                  Penawaran Terakhir
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Nama Penawar
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Penawaran
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Waktu
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bidders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-6 text-center text-foreground-secondary"
                          >
                            Belum ada penawaran untuk lelang ini.
                          </td>
                        </tr>
                      ) : (
                        bidders.slice(0, 5).map((bid) => (
                          <tr
                            key={bid.id}
                            className="hover:bg-surface transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-foreground">
                                {bid.bidder_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                              {formatCurrency(bid.bid_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">
                              {new Date(bid.created_at).toLocaleString(
                                "id-ID",
                                { dateStyle: "long", timeStyle: "medium" }
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Removed admin-managed participants section — admin-added participants are included in `bidders` from detail payload */}

              {/* Countdown */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-foreground-secondary mb-2">
                  Waktu Tersisa:
                </p>
                <CountdownTimer endDate={auction.end_date} />
              </div>

              {/* Bid Button */}
              {!isAuctionEnded && (
                <Button
                  onClick={() => setShowBidModal(true)}
                  className="w-full md:w-auto"
                >
                  Tawar Sekarang
                </Button>
              )}

              {isAuctionEnded && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
                  Lelang ini telah berakhir
                </div>
              )}

              {/* Seller Info */}
              {auction.seller_name && (
                <div className="bg-surface rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">
                    Penjual
                  </h3>
                  <p className="text-foreground-secondary">
                    {auction.seller_name}
                  </p>
                  {auction.seller_info && (
                    <p className="text-sm text-foreground-secondary mt-1">
                      {auction.seller_info}
                    </p>
                  )}
                </div>
              )}

              {/* Organizer Info */}
              {auction.organizer_name && (
                <div className="bg-surface rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">
                    Penyelenggara
                  </h3>
                  <p className="text-foreground-secondary">
                    {auction.organizer_name}
                  </p>
                  {auction.organizer_info && (
                    <p className="text-sm text-foreground-secondary mt-1">
                      {auction.organizer_info}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Removed full participants table - we keep only the latest bids table above */}
        </div>

        {/* Bid Modal */}
        {auction && (
          <BidModal
            auction={auction}
            open={showBidModal}
            onClose={() => setShowBidModal(false)}
            onSubmit={async (amount: number) => {
              try {
                const resp = await fetch("/api/bids", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    auction_id: auction.id,
                    bid_amount: amount,
                  }),
                });

                const data = await resp.json();
                if (!resp.ok) {
                  throw new Error(data.error || "Failed to place bid");
                }

                // Update UI immediately with optimistic update
                const newBid: Bidder = {
                  id: Date.now(), // temporary ID
                  auction_id: auction.id,
                  user_id: null,
                  bidder_name: data.bidder_name || "Anda",
                  bid_amount: amount,
                  bid_count: 1,
                  created_at: new Date().toISOString(),
                };

                setBidders((prev) => [newBid, ...prev]);
                setAuction((prev) =>
                  prev
                    ? {
                        ...prev,
                        highest_bid: Math.max(amount, prev.highest_bid),
                      }
                    : prev
                );

                toast({
                  title: "Berhasil",
                  description: "Penawaran berhasil ditempatkan",
                  variant: "success",
                });

                // Close modal and fetch fresh data in background
                setShowBidModal(false);

                // Refresh data in background
                const r = await fetch(`/api/auctions/${params.id}/detail`);
                if (r.ok) {
                  const d = await r.json();
                  setAuction(d.auction);
                  setImages(d.images || []);
                  setBidders(d.bidders || []);
                }
              } catch (err) {
                console.error("Error placing bid:", err);
                toast({
                  title: "Kesalahan",
                  description: String(err),
                  variant: "destructive",
                });
              }
            }}
          />
        )}
      </main>
    </>
  );
}
