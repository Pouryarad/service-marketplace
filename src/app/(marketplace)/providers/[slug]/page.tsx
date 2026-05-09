import Link from "next/link";
import Image from "next/image";
import { createContactRequest } from "@/app/actions";
import { getCurrentUser, getProvider } from "@/lib/data";
import FavButton from "@/components/FavButton";
import AuthModal from "@/components/AuthModal";
import ContactButton from "@/components/ContactButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SubmitRequestButton from "@/components/SubmitRequestButton";
import Script from "next/script";
import Turnstile from "@/components/Turnstile";

export default async function ProviderProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ request?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const isSuccess = query.request === "success";

  const [provider, user] = await Promise.all([
    getProvider(slug),
    getCurrentUser(),
  ]);

  const supabase = await createSupabaseServerClient();

  let isFav = false;
  let isAdmin = false;

  if (supabase && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (supabase && user && provider) {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider_id", provider.id)
      .single();

    isFav = !!data;
  }

  const isOwnProfile = !!(user && provider && String(user.id) === String(provider.userId));

  if (supabase && provider && !isOwnProfile && !isAdmin) {
    await supabase.from("provider_events").insert({
      provider_id: provider.id,
      event_type: "view_profile",
    });
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-7xl">🔍</p>
          <h1 className="mt-4 text-4xl font-bold text-[#1f1f1f]">Whoops!</h1>
          <p className="mt-2 text-gray-500 text-lg">We couldn't find that provider.</p>
          <Link
            className="mt-6 inline-flex rounded-full bg-[#ff8a00] px-6 py-3 font-bold text-white hover:bg-orange-600 transition"
            href="/"
          >
            Take me home 🏠
          </Link>
        </div>
      </main>
    );
  }

  const name = user?.user_metadata?.full_name ?? "";
  const email = user?.email ?? "";

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
        {/* LEFT SIDE */}
        <div className="space-y-6">

          {/* PROFILE */}
          <div className="bg-white rounded-[12px] p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative h-36 w-36 sm:h-40 sm:w-40 rounded-full overflow-hidden border-4 border-white ring-2 ring-black/5 shadow-lg">
              <Image
                src={provider.profilePhotoUrl}
                alt={provider.fullName}
                fill
                sizes="160px"
                quality={100}
                priority
                className="object-cover scale-105"
              />
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-bold">
              {provider.fullName}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {provider.categoryName} • {provider.location}
            </p>

            <p className="text-sm text-[#2563eb] mt-1">
              {provider.language}
            </p>

            <div className="mt-4 w-full space-y-3">
              <FavButton
                providerId={Number(provider.id)}
                initialIsFav={isFav}
                user={user}
              />

              {user ? (
                <>
                  <ContactButton
                    type="email"
                    value={provider.email}
                    providerId={Number(provider.id)}
                  />
                  <ContactButton
                    type="phone"
                    value={provider.phone}
                    providerId={Number(provider.id)}
                  />
                </>
              ) : (
                <>
                  <AuthModal
                    next={`/providers/${provider.slug}`}
                    trigger={
                      <div className="w-full text-center rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white cursor-pointer">
                        Reveal Email (Sign in)
                      </div>
                    }
                  />
                  <AuthModal
                    next={`/providers/${provider.slug}`}
                    trigger={
                      <div className="w-full text-center rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white cursor-pointer">
                        Reveal Phone (Sign in)
                      </div>
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* ABOUT */}
          {provider.bio && (
            <div className="bg-white rounded-[12px] p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* VIDEO */}
          {provider.videoUrl && (
            <div className="bg-white rounded-[12px] p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-3">Introduction</h2>
              <div className="aspect-video rounded-[10px] overflow-hidden">
                <iframe
                  src={provider.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          {/* PORTFOLIO */}
          {provider.portfolioPhotoUrls && provider.portfolioPhotoUrls.length > 0 && (
            <div className="bg-white rounded-[12px] p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-3">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.portfolioPhotoUrls.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={url}
                      alt={`Portfolio ${i + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-24">

          {isOwnProfile && (
            <div className="mb-3 rounded-xl bg-[#fff8e1] border border-yellow-200 px-4 py-3 text-sm text-yellow-700 font-medium">
              👀 This is how clients see your profile.
            </div>
          )}

          {isAdmin && (
            <div className="mb-3 rounded-xl bg-[#eff6ff] border border-blue-200 px-4 py-3 text-sm text-blue-700 font-medium flex items-center justify-between">
              🛡 Admin View
              <a href="/admin/approvals" className="font-bold underline">← Back to Approvals</a>
            </div>
          )}

          <section className="bg-white rounded-[12px] p-6 shadow-sm">
            <h2 className="text-xl font-bold">Request Contact</h2>

            {!user && (
              <div className="mt-4 rounded-[8px] bg-[#2563eb]/5 p-3 text-sm">
                Sign in to contact this provider
              </div>
            )}

            {isSuccess && (
              <p className="mt-4 rounded-[8px] bg-green-100 p-3 text-sm font-semibold text-green-700">
                Request sent successfully
              </p>
            )}

            <form action={createContactRequest} className="mt-4">
              <fieldset
                disabled={isOwnProfile || isSuccess || isAdmin}
                className={`space-y-3 ${isOwnProfile || isSuccess || isAdmin ? "opacity-40 pointer-events-none select-none grayscale" : ""}`}
              >
                <input type="hidden" name="providerId" value={provider.id} />
                <input name="name" defaultValue={name} placeholder="Name" className="h-12 w-full rounded-[10px] border px-3" />
                <input name="email" defaultValue={email} placeholder="Email" className="h-12 w-full rounded-[10px] border px-3" />
                <input name="phone" placeholder="Phone (optional)" className="h-12 w-full rounded-[10px] border px-3" />
                <textarea name="message" required placeholder="Message" className="min-h-28 w-full rounded-[10px] border p-3" />
                <Turnstile />
                {user ? (
                  <SubmitRequestButton isSuccess={isSuccess} />
                ) : (
                  <AuthModal
                    next={`/providers/${provider.slug}`}
                    trigger={
                      <div className="w-full text-center rounded-full bg-[#ff8a00] px-5 py-3 font-bold text-white cursor-pointer">
                        Sign in to Contact
                      </div>
                    }
                  />
                )}
              </fieldset>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}