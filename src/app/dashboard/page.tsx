import Link from "next/link";
import { Heart, Inbox, Sparkles } from "lucide-react";
import { getContactRequests } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Settings } from "lucide-react";
import RoleConflictModal from "@/components/RoleConflictModal";
import FadeBanner from "@/components/FadeBanner";

export default async function UserDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ settings?: string }>;
}) {
  const { settings } = await searchParams;
  const requests = await getContactRequests();
  const lastCategory = requests?.[0]?.provider?.category_slug;
  const previewRequests = requests.slice(0, 4);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  let suggestions = [];

  if (lastCategory) {
    const requestedIds = requests
      .map((r) => r.provider?.id)
      .filter(Boolean);

    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("category_slug", lastCategory)
      .not("id", "in", `(${requestedIds.join(",") || "0"})`)
      .limit(6);

    suggestions = data || [];
  }


  if (lastCategory === "realtor") {
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("category_slug", "mortgage-broker")
      .limit(3);

    suggestions = [...suggestions, ...(data || [])];
  }

  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let favorites: any[] = [];

  if (supabase && user) {
    const { data: favs } = await supabase
      .from("favorites")
      .select("provider_id")
      .eq("user_id", user.id);

    if (favs && favs.length > 0) {
      const providerIds = favs.map((f) => f.provider_id);

      const { data: providers, error } = await supabase
        .from("providers")
        .select("*")
        .in("id", providerIds);

      if (error) console.error("PROVIDER ERROR:", error);

      favorites = providers || [];
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <RoleConflictModal actualRole="client" />
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8">
        {settings === "saved" && (
  <FadeBanner message="✅ Settings saved successfully." type="green" />
)}
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Dashboard
          </h1>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 text-sm font-semibold text-[#2563eb]"
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>

        <div className="mt-6 space-y-6">

          {/* Favorites */}
          <section className="rounded-[10px] bg-white p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Heart className="text-[#ff8a00]" size={18} />
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold">
                Favorites
              </h2>
            </div>

            {favorites.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No favorites yet</p>
            ) : (
              <div className="mt-4 flex gap-3 sm:gap-4 overflow-x-auto pb-2">
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/providers/${fav.id}`}
                    className="min-w-[160px] sm:min-w-[200px] rounded-[12px] border border-black/10 bg-white p-3 hover:shadow transition"
                  >
                    {/* Image */}
                    <div className="h-28 sm:h-32 w-full overflow-hidden rounded-[10px] bg-gray-100 relative">
                      {fav.profile_photo_url ? (
                        <Image
                          src={fav.profile_photo_url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 160px, 200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-3">
                      <p className="font-semibold text-sm truncate">
                        {fav.full_name}
                      </p>

                      <p className="text-xs text-gray-500 capitalize">
                        {fav.category_slug}
                      </p>

                      <p className="text-xs text-gray-400">
                        {fav.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Requests */}
          <section className="rounded-[10px] bg-white p-4 sm:p-6">
            <Inbox className="text-[#2563eb]" size={18} />

            <div className="flex justify-between items-center mt-3">
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold">
                My Requests
              </h2>

              <Link
                href="/dashboard/requests"
                className="text-xs sm:text-sm text-[#2563eb] font-semibold"
              >
                View all
              </Link>
            </div>

            {requests.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No requests yet</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {previewRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/dashboard/requests/${req.id}`}
                    className="rounded-[10px] border border-black/10 bg-[#f9fafb] p-3 hover:shadow transition flex items-center gap-3"
                  >
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {req.provider?.profile_photo_url ? (
                        <Image
                          src={req.provider.profile_photo_url}
                          alt=""
                          width={96}
                          height={96}
                          className="object-cover h-full w-full"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          👤
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {req.provider?.full_name}
                      </p>

                      <p className="text-xs text-gray-500 capitalize">
                        {req.provider?.category_slug}
                      </p>

                      <p className="text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Suggestions */}
          <section className="rounded-[12px] bg-white p-4 sm:p-6 border border-black/5">

            <h2 className="text-xl font-bold text-[#1f1f1f]">
              Suggestions
            </h2>

            {suggestions.length === 0 ? (
              <p className="mt-2 text-sm text-[#9ca3af]">
                Suggestions appear here
              </p>
            ) : (
              <div className="mt-4 flex gap-3 overflow-x-auto">

                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/providers/${p.id}`}
                    className="min-w-[160px] rounded-[10px] border border-black/10 bg-white p-3 shadow-sm opacity-70 hover:opacity-100 hover:shadow-md transition"
                  >
                    {/* IMAGE */}
                    <div className="h-20 w-full rounded-[8px] overflow-hidden mb-2 bg-gray-100">
                      {p.profile_photo_url ? (
                        <Image
                          src={p.profile_photo_url}
                          alt=""
                          width={160}
                          height={120}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          👤
                        </div>
                      )}
                    </div>

                    {/* CATEGORY */}
                    <p className="text-xs font-bold uppercase text-[#1f1f1f] mb-1">
                      {p.category_slug}
                    </p>

                    {/* NAME */}
                    <p className="font-semibold text-sm">
                      {p.full_name}
                    </p>

                    {/* LOCATION */}
                    <p className="text-xs text-gray-500">
                      {p.location}
                    </p>
                  </Link>
                ))}

              </div>
            )}
          </section>

        </div>
      </section>
    </main>
  );
}