"use client";

import type React from "react";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import type { Auction } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useEffect } from "react";

interface AuctionFormProps {
  auction?: Auction;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function AuctionForm({ auction, onSubmit, onCancel }: AuctionFormProps) {
  const [formData, setFormData] = useState({
    title: auction?.title || "",
    description: auction?.description || "",
    start_price: auction?.start_price || 0,
    highest_bid: auction?.highest_bid || 0,
    seller_name: auction?.seller_name || "",
    seller_info: auction?.seller_info || "",
    organizer_name: auction?.organizer_name || "",
    organizer_info: auction?.organizer_info || "",
    start_date: auction?.start_date?.split("T")[0] || "",
    end_date: auction?.end_date?.split("T")[0] || "",
  });
  const [images, setImages] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({ ...formData, images });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan lelang");
    } finally {
      setLoading(false);
    }
  }

  // If editing an existing auction, load its images so ImageUpload shows them
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!auction) return;
      try {
        const res = await fetch(`/api/auctions/${auction.id}/detail`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const imgs = (data.images || []).map((img: any) => ({
          url: img.image_url,
          filename: img.image_url.split("/").pop(),
          preview: img.image_url,
        }));
        setImages(imgs);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [auction]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("auction.title")}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("auction.description")}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("admin.images")}
        </label>
        <ImageUpload
          onImagesChange={setImages}
          maxImages={10}
          initialImages={images}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("auction.start_price")}
          </label>
          <input
            type="number"
            value={formData.start_price}
            onChange={(e) =>
              setFormData({ ...formData, start_price: Number(e.target.value) })
            }
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            step="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("auction.highest_bid")}
          </label>
          <input
            type="number"
            value={formData.highest_bid}
            onChange={(e) =>
              setFormData({ ...formData, highest_bid: Number(e.target.value) })
            }
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            step="1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("auction.seller")}
          </label>
          <input
            type="text"
            value={formData.seller_name}
            onChange={(e) =>
              setFormData({ ...formData, seller_name: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("auction.organizer")}
          </label>
          <input
            type="text"
            value={formData.organizer_name}
            onChange={(e) =>
              setFormData({ ...formData, organizer_name: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-surface transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : auction ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
