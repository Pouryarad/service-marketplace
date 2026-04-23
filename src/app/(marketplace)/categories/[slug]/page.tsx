import { SlidersHorizontal } from "lucide-react";
import { TopNav } from "@/components/nav";
import { ProviderCard } from "@/components/provider-card";
import { getCategory, getProviders } from "@/lib/data";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ language?: string; location?: string; sort?: string }>;
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

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <TopNav />
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="rounded-[8px] bg-white px-6 py-10 sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2563eb]">
            Category
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-[#1f1f1f] sm:text-5xl">
            {category?.name ?? "Services"}
          </h1>
          <p className="mt-3 max-w-2xl text-[#6b7280]">
            {category?.subtitle ?? "Find verified providers near you."}
          </p>
        </div>

        <form className="mt-5 grid gap-3 rounded-[8px] bg-white p-4 md:grid-cols-[1fr_1fr_220px_auto]">
          <label className="text-sm font-semibold text-[#4b5563]">
            Language
            <input
              name="language"
              defaultValue={filters.language ?? ""}
              placeholder="English, Spanish..."
              className="mt-2 h-12 w-full rounded-[8px] border border-black/10 px-3 text-[#1f1f1f]"
            />
          </label>
          <label className="text-sm font-semibold text-[#4b5563]">
            Location
            <input
              name="location"
              defaultValue={filters.location ?? ""}
              placeholder="Vancouver"
              className="mt-2 h-12 w-full rounded-[8px] border border-black/10 px-3 text-[#1f1f1f]"
            />
          </label>
          <label className="text-sm font-semibold text-[#4b5563]">
            Sort
            <select
              name="sort"
              defaultValue={filters.sort ?? "recommended"}
              className="mt-2 h-12 w-full rounded-[8px] border border-black/10 px-3 text-[#1f1f1f]"
            >
              <option value="recommended">Recommended</option>
              <option value="closest">Closest</option>
            </select>
          </label>
          <button className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 font-bold text-white">
            <SlidersHorizontal size={18} /> Apply
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {providers.length ? (
            providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          ) : (
            <div className="rounded-[8px] bg-white p-10 text-center">
              <h2 className="font-display text-2xl font-bold">No results yet</h2>
              <p className="mt-2 text-[#6b7280]">
                Try a broader location or remove a language filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
