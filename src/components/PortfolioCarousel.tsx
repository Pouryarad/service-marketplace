"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PortfolioCarousel({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1117]">
        <Image
          src={photos[current]}
          alt={`Portfolio ${current + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-contain"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white font-medium">
              {current + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 size-14 rounded-lg overflow-hidden border-2 transition ${i === current ? "border-[#2563eb]" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <Image src={url} alt={`Thumb ${i + 1}`} width={56} height={56} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}