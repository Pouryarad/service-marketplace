import Link from "next/link";
import { Heart, Inbox, Sparkles } from "lucide-react";
import { getContactRequests } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function UserDashboardPage() {
  const requests = await getContactRequests();
  const previewRequests = requests.slice(0, 4);
  const supabase = await createSupabaseServerClient();

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
  <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
    
    {/* Title */}
    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
      Dashboard
    </h1>

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
                href={`/providers/${req.provider?.id}`}
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
      <section className="rounded-[10px] bg-white/60 p-4 sm:p-6 text-[#9ca3af]">
        <Sparkles size={18} />
        <h2 className="mt-3 font-display text-lg sm:text-xl md:text-2xl font-bold">
          Suggestions
        </h2>
        <p className="mt-2 text-sm">
          Personalized matches appear here as usage grows.
        </p>
      </section>

    </div>
  </section>
</main>
  );
}