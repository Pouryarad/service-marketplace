import {
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { ProviderCard } from "@/components/provider-card";
import { getCategory, getProviders, getLanguages } from "@/lib/data";
import Link from "next/link";
import FilterForm from "./FilterForm";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    language?: string;
    location?: string;
    sort?: string;
  }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;

  const category = await getCategory(slug);

  const providers = await getProviders({
    categorySlug: slug,
    language: filters.language,
    location: filters.location,
    sort: filters.sort,
  });

  const languages = await getLanguages();

  const hasFilters =
    filters.language || filters.location || filters.sort;

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <div className="rounded-[16px] bg-white px-5 py-8 shadow-sm sm:px-8 sm:py-10">

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2563eb]">
            Category
          </p>

          <h1 className="mt-3 font-display text-3xl font-bold text-[#1f1f1f] sm:text-4xl lg:text-5xl">
            {category?.name ?? "Services"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280] sm:text-base">
            Find trusted and verified providers near you.
          </p>

        </div>

        {/* FILTERS */}
        <FilterForm
  slug={slug}
  languages={languages}
  initialLanguage={filters.language ?? ""}
  initialLocation={filters.location ?? ""}
  initialSort={filters.sort ?? "recommended"}
/>

        {/* RESULTS */}
        <div className="mt-6 space-y-4">

          {providers.length ? (
            providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
              />
            ))
          ) : (
            <div className="rounded-[16px] bg-white p-10 text-center shadow-sm">

              <h2 className="font-display text-2xl font-bold">
                No results yet
              </h2>

              <p className="mt-2 text-sm text-[#6b7280]">
                Try another location or remove filters.
              </p>

            </div>
          )}

        </div>

      </section>
    </main>
  );
}