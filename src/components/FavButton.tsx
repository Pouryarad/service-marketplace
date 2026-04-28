"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function FavButton() {
  const [fav, setFav] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFav(!fav)}
      className="grid size-11 place-items-center rounded-full border border-black/10 hover:bg-[#fff7ed] active:scale-95 transition"
      aria-label="Favorite"
    >
      <Star
        size={21}
        className={fav ? "fill-[#ff8a00] text-[#ff8a00]" : "text-[#ff8a00]"}
      />
    </button>
  );
}