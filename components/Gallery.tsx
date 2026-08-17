"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectGalleryItem } from "@/lib/types";

export function Gallery({ items }: { items: ProjectGalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(() => {
    setActiveIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
  }, [items.length]);
  const showNext = useCallback(() => {
    setActiveIndex((i) => (i === null ? i : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, close, showPrev, showNext]);

  if (items.length === 0) return null;

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            {item.media_type === "video" ? (
              <>
                <video src={item.media_url} muted playsInline className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-brown-900/20 transition-colors group-hover:bg-brown-900/30">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-brown-900">
                    ▶
                  </span>
                </span>
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.media_url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/95 px-4 py-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream hover:bg-cream/20"
          >
            ×
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream hover:bg-cream/20 sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream hover:bg-cream/20 sm:right-4"
              >
                ›
              </button>
            </>
          )}

          {active.media_type === "video" ? (
            <video
              src={active.media_url}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.media_url}
              alt=""
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {items.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-cream/70">
              {activeIndex! + 1} / {items.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
