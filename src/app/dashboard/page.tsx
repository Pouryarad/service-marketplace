import Link from "next/link";
import { Heart, Inbox, Sparkles } from "lucide-react";
import { getContactRequests } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function UserDashboardPage() {
  const requests = await getContactRequests();
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
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <h1 className="font-display text-4xl font-bold">Dashboard</h1>

        <div className="mt-6 space-y-6">

          {/* Favorites */}
          <section className="rounded-[8px] bg-white p-6">
            <div className="flex items-center gap-2">
              <Heart className="text-[#ff8a00]" />
              <h2 className="font-display text-2xl font-bold">Favorites</h2>
            </div>

            {favorites.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No favorites yet</p>
            ) : (
              <div
                className="mt-4 flex gap-4 overflow-x-auto pb-2"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/providers/${fav.id}`}
                    className="min-w-[180px] sm:min-w-[220px] rounded-[12px] border border-black/10 bg-white p-3 hover:shadow transition"
                  >
                    {/* Image */}
                    <div className="h-32 w-full overflow-hidden rounded-[8px] bg-gray-100 relative">
                      {fav.profile_photo_url ? (
                        <Image
                          src={fav.profile_photo_url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 180px, 220px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-3">
                      <p className="font-semibold text-sm text-[#1f1f1f]">
                        {fav.full_name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {fav.category_slug}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {fav.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Requests */}
          <section className="rounded-[8px] bg-white p-6">
            <Inbox className="text-[#2563eb]" />
            <h2 className="mt-5 font-display text-2xl font-bold">My Requests</h2>

            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <p
                  key={request.id}
                  className="rounded-[8px] bg-[#f3f5f9] p-3 text-sm"
                >
                  {request.providerName}: {request.status}
                </p>
              ))}
            </div>
          </section>

          {/* Suggestions */}
          <section className="rounded-[8px] bg-white/60 p-6 text-[#9ca3af]">
            <Sparkles />
            <h2 className="mt-5 font-display text-2xl font-bold">
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