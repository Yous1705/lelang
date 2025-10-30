"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Auction } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface BidModalProps {
  auction: Auction | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void> | void;
}

export function BidModal({ auction, open, onClose, onSubmit }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // safe defaults so hooks and render order stay consistent
  const highestBid = auction ? auction.highest_bid ?? auction.start_price : 0;
  const startPrice = auction ? auction.start_price : 0;

  useEffect(() => {
    if (open && auction) {
      setBidAmount((auction.highest_bid ?? auction.start_price) + 1);
      setError("");
      inputRef.current?.focus();
    }
  }, [open, auction]);

  if (!open || !auction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (bidAmount <= highestBid) {
        setError(
          `Penawaran harus lebih besar dari ${formatCurrency(highestBid)}`
        );
        setLoading(false);
        return;
      }

      await Promise.resolve(onSubmit(bidAmount));
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menempatkan penawaran"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {auction.title}
        </h2>

        <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground-secondary">
              {t("lelang.penawaranTertinggi")}
            </span>
            <strong className="font-medium">
              {formatCurrency(highestBid)}
            </strong>
          </div>

          <div className="grid gap-2">
            <label htmlFor="bid" className="text-sm text-foreground-secondary">
              {t("lelang.penawaran.nominal")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-sm text-foreground-secondary">
                Rp
              </span>
              <Input
                id="bid"
                type="number"
                min={startPrice}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="pl-12 pr-4"
                ref={inputRef}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="flex-1"
          >
            {t("umum.batal")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white hover:bg-primary/90"
          >
            {loading ? t("umum.memuat") : t("lelang.penawaran.ajukan")}
          </Button>
        </div>
      </form>
    </div>
  );
}
