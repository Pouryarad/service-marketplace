import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { Provider } from "@/lib/types";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <article className="flex flex-col gap-4 rounded-[8px] border border-black/5 bg-white p-4 sm:flex-row sm:items-center">
      <Image
        src={provider.profilePhotoUrl}
        alt=""
        width={80}
        height={80}
        className="size-20 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl font-bold text-[#1f1f1f]">
            {provider.fullName}
          </h3>
          {provider.featuredRank && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2563eb]/10 px-2 py-1 text-xs font-bold text-[#2563eb]">
              <Star size={12} fill="currentColor" /> Featured
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-[#6b7280]">
          <MapPin size={14} /> {provider.location}
          {provider.businessName ? ` · ${provider.businessName}` : ""}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#4b5563]">{provider.oneLine}</p>
      </div>
      <Link
        href={`/providers/${provider.id}`}
        className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        View Profile
      </Link>
    </article>
  );
}
