"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const BC_LOCATIONS = [
  "Abbotsford", "Burnaby", "Brentwood", "Coquitlam", "Delta",
  "Downtown Vancouver", "East Vancouver", "Kelowna", "Kitsilano",
  "Langley", "Maple Ridge", "Mission", "Mount Pleasant", "New Westminster",
  "North Vancouver", "Port Coquitlam", "Port Moody", "Richmond",
  "South Surrey", "Surrey", "Tsawwassen", "UBC", "Vancouver",
  "Victoria", "West End", "West Vancouver", "White Rock", "Yaletown",
];

export default function FilterForm({
  slug,
  languages,
  initialLanguage,
  initialLocation,
  initialSort,
}: {
  slug: string;
  languages: string[];
  initialLanguage: string;
  initialLocation: string;
  initialSort: string;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);
  const [location, setLocation] = useState(initialLocation);
  const [sort, setSort] = useState(initialSort || "recommended");

  const hasFilters = initialLanguage || initialLocation || (initialSort && initialSort !== "recommended");

  const handleApply = () => {
    const params = new URLSearchParams();
    if (language) params.set("language", language);
    if (location) params.set("location", location);
    if (sort && sort !== "recommended") params.set("sort", sort);
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const handleClear = () => {
    setLanguage("");
    setLocation("");
    setSort("recommended");
    router.push(`/categories/${slug}`);
  };

  return (
    <details className="mt-5 rounded-[16px] bg-white shadow-sm group lg:open">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filters
        </div>
        <ChevronDown size={18} className="transition group-open:rotate-180" />
      </summary>

      <div className="grid grid-cols-1 gap-3 border-t border-black/5 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_220px_auto]">

        {/* LANGUAGE */}
        <label className="text-sm font-semibold text-[#4b5563]">
          Language
          <div className="relative mt-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-12 w-full appearance-none rounded-[10px] border border-black/10 bg-white pl-3 pr-10 text-[#1f1f1f] outline-none"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">▼</span>
          </div>
        </label>

        {/* LOCATION */}
        <label className="text-sm font-semibold text-[#4b5563]">
          Location
          <div className="relative mt-2">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 w-full appearance-none rounded-[10px] border border-black/10 bg-white pl-3 pr-10 text-[#1f1f1f] outline-none"
            >
              <option value="">All Locations</option>
              {BC_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">▼</span>
          </div>
        </label>

        {/* SORT */}
        <label className="text-sm font-semibold text-[#4b5563]">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="mt-2 h-12 w-full rounded-[10px] border border-black/10 px-3 text-[#1f1f1f] outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="az">A → Z</option>
          </select>
        </label>

        {/* ACTION */}
        <div className="flex items-end">
          {hasFilters ? (
            <button
              onClick={handleClear}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-red-500 px-5 font-bold text-white transition hover:bg-red-600"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 font-bold text-white transition hover:bg-blue-700"
            >
              <SlidersHorizontal size={18} />
              Apply
            </button>
          )}
        </div>
      </div>
    </details>
  );
}