"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  url: string;
  filename: string;
  preview?: string;
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  initialImages?: UploadedImage[];
}

export function ImageUpload({
  onImagesChange,
  maxImages = 10,
  initialImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = async (files: FileList) => {
    if (images.length >= maxImages) {
      toast({
        title: "Batas Gambar",
        description: `Maksimal ${maxImages} gambar per lelang`,
        variant: "destructive",
      });
      return;
    }

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const newImages = data.files.map((file: any) => ({
        url: file.url,
        filename: file.filename,
        preview: file.url,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);

      toast({
        title: "Berhasil",
        description: `${newImages.length} gambar berhasil diunggah`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal mengunggah gambar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      uploadFiles(e.dataTransfer.files);
    },
    [images.length, maxImages]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  // Keep internal images in sync when parent provides initialImages (e.g., editing existing auction)
  React.useEffect(() => {
    setImages(initialImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialImages)]);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-surface"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-foreground-secondary" />
          <div>
            <p className="font-medium text-foreground">
              Seret gambar ke sini atau klik untuk memilih
            </p>
            <p className="text-sm text-foreground-secondary">
              Maksimal {maxImages} gambar, format: JPG, PNG, WebP
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading || images.length >= maxImages}
          className="hidden"
          // don't rely on id/label; we'll trigger via ref to avoid nested interactive elements
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4 bg-transparent"
          disabled={isUploading || images.length >= maxImages}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Mengunggah..." : "Pilih Gambar"}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-surface rounded-lg overflow-hidden border border-border">
                <img
                  src={image.preview || image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-destructive text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-foreground-secondary mt-1 truncate">
                {image.filename}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-foreground-secondary">
        {images.length} / {maxImages} gambar
      </p>
    </div>
  );
}
