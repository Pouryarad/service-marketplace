import {
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { ProviderCard } from "@/components/provider-card";
import { getCategory, getProviders, getLanguages } from "@/lib/data";
import Link from "next/link";

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
        <details className="mt-5 rounded-[16px] bg-white shadow-sm group lg:open">

  {/* TOGGLE */}
  <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-[#1f1f1f]">

    <div className="flex items-center gap-2">
      <SlidersHorizontal size={18} />
      Filters
    </div>

    <ChevronDown
      size={18}
      className="transition group-open:rotate-180"
    />

  </summary>

  {/* FILTER FORM */}
  <form className="grid grid-cols-1 gap-3 border-t border-black/5 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_220px_auto]">

    {/* LANGUAGE */}
    <label className="text-sm font-semibold text-[#4b5563]">

      Language

      <div className="relative mt-2">

        <select
          name="language"
          defaultValue={filters.language ?? ""}
          className="h-12 w-full appearance-none rounded-[10px] border border-black/10 bg-white pl-3 pr-10 text-[#1f1f1f] outline-none"
        >
          <option value="">All Languages</option>

          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
          ▼
        </span>

      </div>

    </label>

    {/* LOCATION */}
    <label className="text-sm font-semibold text-[#4b5563]">

      Location

      <input
        name="location"
        defaultValue={filters.location ?? ""}
        placeholder="Vancouver"
        className="mt-2 h-12 w-full rounded-[10px] border border-black/10 px-3 text-[#1f1f1f] outline-none"
      />

    </label>

    {/* SORT */}
    <label className="text-sm font-semibold text-[#4b5563]">

      Sort

      <select
        name="sort"
        defaultValue={filters.sort ?? "recommended"}
        className="mt-2 h-12 w-full rounded-[10px] border border-black/10 px-3 text-[#1f1f1f] outline-none"
      >
        <option value="recommended">Recommended</option>
        <option value="az">A → Z</option>
      </select>

    </label>

    {/* ACTION */}
    <div className="flex items-end">

      {hasFilters ? (
        <Link
          href={`/categories/${slug}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-red-500 px-5 font-bold text-white transition hover:bg-red-600"
        >
          Clear Filters
        </Link>
      ) : (
        <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 font-bold text-white transition hover:bg-blue-700">
          <SlidersHorizontal size={18} />
          Apply
        </button>
      )}

    </div>

  </form>

</details>

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