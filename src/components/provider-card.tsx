import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { Provider } from "@/lib/types";

export function ProviderCard({ provider }: { provider: Provider }) {
  const languages = provider.language?.split(",").map((l) => l.trim()).slice(0, 3) ?? [];

  return (
    <article className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-sm transition hover:shadow-md">
      {/* Blue top bar */}
      <div className="h-1.5 bg-[#2563eb]" />

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">

        {/* Photo */}
        <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:mx-0 sm:h-28 sm:w-28 ring-4 ring-[#eff6ff]">
          <Image
            src={provider.profilePhotoUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <h3 className="font-black text-xl text-[#0f1117] sm:text-2xl">
              {provider.fullName}
            </h3>
            {provider.featuredRank && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-bold text-[#2563eb]">
                <Star size={11} fill="currentColor" /> Featured
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="flex items-center gap-1 text-sm text-[#6b7280]">
              <MapPin size={13} /> {provider.location}
              {provider.businessName ? ` · ${provider.businessName}` : ""}
            </span>
            {languages.map((lang) => (
              <span key={lang} className="rounded-full border border-black/[0.06] bg-[#f3f5f9] px-2.5 py-0.5 text-xs text-[#6b7280]">
                {lang}
              </span>
            ))}
          </div>

          {provider.oneLine && (
            <p className="mt-2 text-sm text-[#4b5563] leading-relaxed line-clamp-2">
              {provider.oneLine}
            </p>
          )}
        </div>

        {/* Button */}
        <div className="shrink-0">
          <Link
            href={`/providers/${provider.slug}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            View Profile →
          </Link>
        </div>

      </div>
    </article>
  );
}