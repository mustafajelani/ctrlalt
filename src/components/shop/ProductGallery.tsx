"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/content/products";

/** Main photo with previous/next controls and a thumbnail strip (only when there's more than one photo). */
export function ProductGallery({ images, name, badge }: { images: ProductImage[]; name: string; badge: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index] ?? images[0];
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <div className="hero-fade" style={{ "--d": "0s" } as React.CSSProperties}>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-panel">
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt || `${name}, photo ${i + 1} of ${count}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          />
        ))}
        {badge}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line-2 bg-ink/75 text-mist backdrop-blur transition-colors hover:border-signal hover:text-signal-hot"
            >
              <CaretLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line-2 bg-ink/75 text-mist backdrop-blur transition-colors hover:border-signal hover:text-signal-hot"
            >
              <CaretRight size={20} aria-hidden />
            </button>
            <p className="absolute right-3 bottom-3 rounded-full bg-ink/75 px-2.5 py-1 font-mono text-xs text-mist backdrop-blur" aria-live="polite">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7" aria-label="Product photos">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block aspect-square w-full overflow-hidden rounded-lg border border-line transition-colors hover:border-line-2 aria-[current=true]:border-signal"
              >
                <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {current && <span className="sr-only">Showing photo {index + 1} of {count}</span>}
    </div>
  );
}
