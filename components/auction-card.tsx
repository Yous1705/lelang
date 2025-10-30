"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import type { Auction, AuctionImage } from "@/lib/types";

interface AuctionCardProps {
  auction: Auction;
  images?: AuctionImage[];
  onBidClick: (auction: Auction) => void;
}

function AuctionCardInner({ auction, images, onBidClick }: AuctionCardProps) {
  const endDate = useMemo(() => new Date(auction.end_date), [auction.end_date]);
  const now = useMemo(() => new Date(), []);
  const isEnded = endDate < now;

  const { daysLeft, hoursLeft } = useMemo(() => {
    const timeLeft = Math.max(0, endDate.getTime() - new Date().getTime());
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return { daysLeft: days, hoursLeft: hours };
  }, [endDate]);

  const imageUrl =
    images && images.length > 0 ? images[0].image_url : "/placeholder.svg";

  return (
    <Link href={`/detail/${auction.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer hover:border-primary/30">
        <div className="relative w-full aspect-video bg-surface overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={auction.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
          />
          {isEnded && (
            <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                Lelang Berakhir
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground line-clamp-2 text-base">
            {auction.title}
          </h3>
          <p className="text-sm text-foreground-secondary line-clamp-2 flex-1">
            {auction.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-secondary">
                Penawaran Tertinggi:
              </span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(auction.highest_bid)}
              </span>
            </div>

            {!isEnded && (
              <div className="text-sm text-foreground-secondary bg-primary/10 px-2 py-1 rounded">
                {daysLeft > 0
                  ? `${daysLeft}h ${hoursLeft}m tersisa`
                  : `${hoursLeft}h tersisa`}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              onBidClick(auction);
            }}
            disabled={isEnded}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            {isEnded ? "Lelang Berakhir" : "Tawar Sekarang"}
          </button>
        </div>
      </div>
    </Link>
  );
}

export const AuctionCard = React.memo(AuctionCardInner);
