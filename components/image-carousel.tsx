"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: Array<{ id: number; image_url: string; display_order: number }>;
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const hasImages = Array.isArray(images) && images.length > 0;

  const currentImage = useMemo(
    () => (hasImages ? images[currentIndex] : null),
    [images, currentIndex, hasImages]
  );

  if (!hasImages) {
    return (
      <div className="w-full aspect-video bg-surface rounded-lg flex items-center justify-center border border-border">
        <p className="text-foreground-secondary">Tidak ada gambar</p>
      </div>
    );
  }

  const handlePrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleNext = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.targetTouches[0].clientX);

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrevious();
  };

  return (
    <div className="space-y-4">
      <div
        className="relative w-full bg-surface rounded-lg overflow-hidden border border-border group"
        style={{ minHeight: "300px", maxHeight: "500px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={currentImage?.image_url || "/placeholder.svg"}
            alt={`Auction image ${currentIndex + 1}`}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/70 hover:bg-primary/85 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/70 hover:bg-primary/85 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-2 right-2 bg-primary/70 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
                index === currentIndex ? "border-primary" : "border-border"
              }`}
              aria-label={`Select image ${index + 1}`}
            >
              <div className="w-full h-full flex items-center justify-center bg-surface">
                <img
                  src={image.image_url || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
