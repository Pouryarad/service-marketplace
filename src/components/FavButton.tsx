"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toggleFavorite } from "@/app/actions";
import AuthModal from "@/components/AuthModal";
import { useRouter } from "next/navigation";

export default function FavButton({
  providerId,
  initialIsFav,
  user,
}: {
  providerId: number;
  initialIsFav: boolean;
  user: any;
}) {
  const [isFav, setIsFav] = useState(initialIsFav);
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return (
      <AuthModal
        next={`/providers/${providerId}`}
        trigger={
          <button className="rounded-full p-2 hover:bg-gray-100">
            <Star className="text-[#ff8a00]" />
          </button>
        }
      />
    );
  }

  const router = useRouter();
  const handleClick = () => {
  startTransition(async () => {
    await toggleFavorite(providerId);
    window.location.reload(); // 👈 force refresh
  });
};

  return (
    <button
      onClick={handleClick}
      className="rounded-full p-2 hover:bg-gray-100"
    >
      <Star
        className="text-[#ff8a00]"
        fill={isFav ? "#ff8a00" : "none"}
      />
    </button>
  );
}