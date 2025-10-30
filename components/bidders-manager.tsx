"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import type { Bidder } from "@/lib/types";

interface BiddersManagerProps {
  auctionId: number;
  bidders: Bidder[];
  onClose: () => void;
  onUpdate: () => void;
}

export function BiddersManager({
  auctionId,
  bidders,
  onClose,
  onUpdate,
}: BiddersManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localBidders, setLocalBidders] = useState(bidders);
  const [newBidder, setNewBidder] = useState({ name: "", amount: "" });

  const handleAddBidder = () => {
    if (!newBidder.name || !newBidder.amount) {
      toast({
        title: "Kesalahan",
        description: "Nama dan jumlah penawaran harus diisi",
        variant: "destructive",
      });
      return;
    }

    const bidder = {
      id: Date.now(),
      auction_id: auctionId,
      user_id: null,
      bidder_name: newBidder.name,
      bid_amount: Number.parseFloat(newBidder.amount),
      bid_count: 1,
      created_at: new Date().toISOString(),
    };

    setLocalBidders([...localBidders, bidder]);
    setNewBidder({ name: "", amount: "" });
  };

  const handleRemoveBidder = (id: number) => {
    setLocalBidders(localBidders.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bidders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidders: localBidders }),
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error("Update failed");

      toast({
        title: "Berhasil",
        description: "Peserta lelang berhasil diperbarui",
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal memperbarui peserta lelang",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Peserta Lelang</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-surface rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-3">
              Tambah Peserta Baru
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nama peserta"
                value={newBidder.name}
                onChange={(e) =>
                  setNewBidder({ ...newBidder, name: e.target.value })
                }
              />
              <div className="flex items-center border border-border rounded">
                <span className="px-3 text-sm">Rp</span>
                <input
                  className="flex-1 px-3 py-2 bg-transparent outline-none"
                  placeholder="0"
                  type="number"
                  value={newBidder.amount}
                  onChange={(e) =>
                    setNewBidder({ ...newBidder, amount: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleAddBidder}
                className="bg-primary text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Peserta (ditambahkan oleh admin) ({localBidders.length})
            </h3>
            <div className="space-y-2">
              {localBidders.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  Tidak ada peserta
                </p>
              ) : (
                localBidders.map((bidder) => (
                  <div
                    key={bidder.id}
                    className="flex items-center justify-between bg-surface p-3 rounded border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {bidder.bidder_name}
                      </p>
                      <p className="text-sm text-foreground-secondary">
                        {formatCurrency(bidder.bid_amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBidder(bidder.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary text-white"
          >
            {loading ? "Menyimpan..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
