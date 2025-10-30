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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Auction } from "@/lib/types";
import { ImageUpload } from "@/components/image-upload";
import { useEffect } from "react";

interface AdminAuctionEditorProps {
  auction: Auction;
  onClose: () => void;
  onUpdate: () => void;
}

export function AdminAuctionEditor({
  auction,
  onClose,
  onUpdate,
}: AdminAuctionEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "basic" | "bid" | "seller" | "organizer" | "images"
  >("basic");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<
    Array<{ id?: number; url: string; filename: string }>
  >([]);

  const [formData, setFormData] = useState({
    title: auction.title,
    description: auction.description,
    start_price: auction.start_price,
    highest_bid: auction.highest_bid,
    seller_name: auction.seller_name || "",
    seller_info: auction.seller_info || "",
    organizer_name: auction.organizer_name || "",
    organizer_info: auction.organizer_info || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auctions/${auction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error("Update failed");

      toast({
        title: "Berhasil",
        description: "Lelang berhasil diperbarui",
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Kesalahan",
        description: "Gagal memperbarui lelang",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load existing images for this auction
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/auctions/${auction.id}/detail`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const imgs = (data.images || []).map((img: any) => ({
          id: img.id,
          url: img.image_url,
          filename: img.image_url.split("/").pop(),
        }));
        setImages(imgs);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [auction.id]);

  const handleImagesChange = async (
    updated: Array<{ url: string; filename: string }>
  ) => {
    // updated contains newly uploaded images (from /api/upload)
    // Save them into DB
    try {
      // The images API expects an array of filenames (relative to /uploads)
      const filenames = updated.map((i) => i.filename).filter(Boolean);
      const payload = { auctionId: auction.id, filenames };
      const res = await fetch("/api/auctions/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to save images");
      }
      // Refresh images list
      const r = await fetch(`/api/auctions/${auction.id}/detail`);
      if (r.ok) {
        const d = await r.json();
        const imgs = (d.images || []).map((img: any) => ({
          id: img.id,
          url: img.image_url,
          filename: img.image_url.split("/").pop(),
        }));
        setImages(imgs);
        toast({ title: "Berhasil", description: "Gambar berhasil disimpan" });
      }
    } catch (err) {
      console.error("Error saving images:", err);
      toast({
        title: "Kesalahan",
        description: "Gagal menyimpan gambar",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId?: number) => {
    if (!imageId) return;
    try {
      const res = await fetch("/api/auctions/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to delete image");
      }
      setImages((s) => s.filter((i) => i.id !== imageId));
      toast({ title: "Berhasil", description: "Gambar dihapus" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Kesalahan",
        description: "Gagal menghapus gambar",
        variant: "destructive",
      });
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
          <DialogTitle>Edit Lelang: {auction.title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 border-b border-border mb-4">
          {["basic", "bid", "seller", "organizer", "images"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary -mb-[2px]"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              {tab === "basic" && "Dasar"}
              {tab === "bid" && "Penawaran"}
              {tab === "seller" && "Penjual"}
              {tab === "organizer" && "Penyelenggara"}
              {tab === "images" && "Gambar"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === "basic" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Judul
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Judul lelang"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Deskripsi
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Deskripsi lelang"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Harga Awal
                </label>
                <div className="flex items-center">
                  <span className="flex-none px-3 py-2 bg-surface border border-r-0 border-border rounded-l">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={formData.start_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_price: Number.parseFloat(e.target.value),
                      })
                    }
                    placeholder="Harga awal"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "bid" && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground-secondary mb-3">
                Penawaran tertinggi saat ini:{" "}
                <span className="font-bold text-foreground">
                  {formatCurrency(auction.highest_bid)}
                </span>
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Edit Penawaran Tertinggi
                </label>
                <div className="flex items-center">
                  <span className="flex-none px-3 py-2 bg-surface border border-r-0 border-border rounded-l">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={formData.highest_bid}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        highest_bid: Number.parseFloat(e.target.value),
                      })
                    }
                    placeholder="Penawaran tertinggi"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "seller" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nama Penjual
                </label>
                <Input
                  value={formData.seller_name}
                  onChange={(e) =>
                    setFormData({ ...formData, seller_name: e.target.value })
                  }
                  placeholder="Nama penjual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Informasi Penjual
                </label>
                <Textarea
                  value={formData.seller_info}
                  onChange={(e) =>
                    setFormData({ ...formData, seller_info: e.target.value })
                  }
                  placeholder="Informasi penjual"
                  rows={3}
                />
              </div>
            </>
          )}

          {activeTab === "organizer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nama Penyelenggara
                </label>
                <Input
                  value={formData.organizer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, organizer_name: e.target.value })
                  }
                  placeholder="Nama penyelenggara"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Informasi Penyelenggara
                </label>
                <Textarea
                  value={formData.organizer_info}
                  onChange={(e) =>
                    setFormData({ ...formData, organizer_info: e.target.value })
                  }
                  placeholder="Informasi penyelenggara"
                  rows={3}
                />
              </div>
            </>
          )}

          {activeTab === "images" && (
            <div>
              <p className="text-sm text-foreground-secondary mb-4">
                Gambar Lelang
              </p>
              <ImageUpload
                onImagesChange={(imgs) => handleImagesChange(imgs)}
                initialImages={images.map((i) => ({
                  url: i.url,
                  filename: i.filename,
                }))}
              />

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative">
                      <div className="aspect-square bg-surface rounded overflow-hidden border border-border">
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteImage(img.id);
                          }}
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
