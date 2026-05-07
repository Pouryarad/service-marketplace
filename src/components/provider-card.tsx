import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { Provider } from "@/lib/types";

export function ProviderCard({
  provider,
}: {
  provider: Provider;
}) {
  return (
    <article className="overflow-hidden rounded-[16px] border border-black/5 bg-white shadow-sm transition hover:shadow-md">

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">

        {/* IMAGE */}
        <div className="relative mx-auto h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 sm:mx-0 sm:h-28 sm:w-28">

          <Image
            src={provider.profilePhotoUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />

        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1 text-center sm:text-left">

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">

            <h3 className="font-display text-xl font-bold text-[#1f1f1f] sm:text-2xl">
              {provider.fullName}
            </h3>

            {provider.featuredRank && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2563eb]/10 px-2 py-1 text-xs font-bold text-[#2563eb]">
                <Star size={12} fill="currentColor" />
                Featured
              </span>
            )}

          </div>

          <p className="mt-2 flex flex-wrap items-center justify-center gap-1 text-sm text-[#6b7280] sm:justify-start">

            <MapPin size={14} />

            {provider.location}

            {provider.businessName
              ? ` · ${provider.businessName}`
              : ""}

          </p>

          <p className="mt-3 text-sm leading-6 text-[#4b5563]">
            {provider.oneLine}
          </p>

        </div>

        {/* BUTTON */}
        <div className="sm:flex-shrink-0">

          <Link
            href={`/providers/${provider.slug}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            View Profile
          </Link>

        </div>

      </div>

    </article>
  );
}