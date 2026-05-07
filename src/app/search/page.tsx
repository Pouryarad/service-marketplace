import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const params = await searchParams;
  const query = params?.q?.trim() || "";
  let providers: any[] = [];

  if (query) {
    const terms = query.toLowerCase().split(" ").filter(Boolean);
    const filters: string[] = [];

    terms.forEach((term) => {
      filters.push(`full_name.ilike.%${term}%`);
      filters.push(`category_slug.ilike.%${term}%`);
      filters.push(`language.ilike.%${term}%`);
      filters.push(`location.ilike.%${term}%`);
      filters.push(`bio.ilike.%${term}%`);
    });

    const { data } = await supabase
      .from("providers")
      .select("*")
      .or(filters.join(","))
      .eq("approved", true)
      .eq("suspended", false)
      .eq("subscription_status", "active");

    providers = data || [];
  }

  return (
    <main className="min-h-screen bg-[#f3f5f9] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/"
            className="grid size-9 place-items-center rounded-full bg-white shadow-sm hover:bg-[#f3f5f9] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Search Results</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Results for &quot;{query}&quot;
            </p>
          </div>
        </div>

        {/* Empty */}
        {providers.length === 0 ? (
          <div className="rounded-[12px] bg-white p-8 text-center text-gray-500">
            No providers found for &quot;{query}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/providers/${provider.slug ?? provider.id}`}
                className="rounded-[14px] border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-[12px] bg-gray-100">
                  {provider.profile_photo_url ? (
                    <Image
                      src={provider.profile_photo_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      👤
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-xs font-bold uppercase text-[#2563eb]">
                    {provider.category_slug}
                  </p>
                  <h2 className="mt-1 font-semibold text-sm sm:text-base">
                    {provider.full_name}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {provider.location}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                    {provider.one_line}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}