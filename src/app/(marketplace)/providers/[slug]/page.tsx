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
import PortfolioCarousel from "@/components/PortfolioCarousel";

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
          <Link className="mt-6 inline-flex rounded-full bg-[#2563eb] px-6 py-3 font-bold text-white hover:bg-blue-700 transition" href="/">
            Take me home 🏠
          </Link>
        </div>
      </main>
    );
  }

  const name = user?.user_metadata?.full_name ?? "";
  const email = user?.email ?? "";
  const languages = provider.language?.split(",").map((l: string) => l.trim()) ?? [];

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      {/* Admin / Own Profile banners */}
      {(isOwnProfile || isAdmin) && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          {isOwnProfile && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700 font-medium flex items-center justify-between">
              <span>👀 This is how clients see your profile.</span>
              <Link href="/provider/dashboard" className="font-bold underline shrink-0 ml-3">Exit</Link>
            </div>
          )}
          {isAdmin && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 font-medium flex items-center justify-between">
              🛡 Admin View
              <a href="/admin/approvals" className="font-bold underline">← Back</a>
            </div>
          )}
        </div>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 lg:py-10">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Hero Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.04]">
            {/* Blue accent bar */}
            <div className="h-2 bg-[#2563eb]" />
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0 size-24 sm:size-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-md">
                  <Image
                    src={provider.profilePhotoUrl}
                    alt={provider.fullName}
                    fill
                    sizes="112px"
                    quality={100}
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-[#0f1117] leading-tight">{provider.fullName}</h1>
                      {provider.businessName && (
                        <p className="text-sm text-[#6b7280] mt-0.5">{provider.businessName}</p>
                      )}
                    </div>
                    {!isOwnProfile && !isAdmin && (
                      <FavButton providerId={Number(provider.id)} initialIsFav={isFav} user={user} />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                      {provider.categoryName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f5f9] px-3 py-1 text-xs font-medium text-[#6b7280]">
                      📍 {provider.location}
                    </span>
                  </div>
                  {languages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {languages.map((lang: string) => (
                        <span key={lang} className="rounded-full border border-black/[0.06] px-2.5 py-0.5 text-xs text-[#6b7280]">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {provider.oneLine && (
                <p className="mt-4 text-sm font-medium text-[#374151] italic border-t border-black/[0.04] pt-4">
                  "{provider.oneLine}"
                </p>
              )}

              {/* Contact buttons */}
              {!isAdmin && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {user ? (
                    <>
                      <ContactButton type="email" value={provider.email} providerId={Number(provider.id)} />
                      <ContactButton type="phone" value={provider.phone} providerId={Number(provider.id)} />
                    </>
                  ) : (
                    <>
                      <AuthModal
                        next={`/providers/${provider.slug}`}
                        trigger={
                          <div className="flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white cursor-pointer hover:bg-blue-700 transition">
                            ✉ Sign in to Reveal Email
                          </div>
                        }
                      />
                      <AuthModal
                        next={`/providers/${provider.slug}`}
                        trigger={
                          <div className="flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white cursor-pointer hover:bg-blue-700 transition">
                            📞 Sign in to Reveal Phone
                          </div>
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {provider.bio && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-black text-[#0f1117] mb-3">About</h2>
              <p className="text-sm text-[#374151] leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Video */}
          {provider.videoUrl && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-black text-[#0f1117] mb-3">Introduction</h2>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={(() => {
                    const url = provider.videoUrl;
                    const watchMatch = url.match(/[?&]v=([^&]+)/);
                    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
                    const videoId = watchMatch?.[1] ?? shortMatch?.[1] ?? "";
                    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                  })()}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          {/* Portfolio Carousel */}
          {provider.portfolioPhotoUrls && provider.portfolioPhotoUrls.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04]">
              <h2 className="text-base font-black text-[#0f1117] mb-3">Portfolio</h2>
              <PortfolioCarousel photos={provider.portfolioPhotoUrls} />
            </div>
          )}
        </div>

        {/* RIGHT — Contact Form */}
        <div className="mt-4 lg:mt-0 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04]">
            <h2 className="text-base font-black text-[#0f1117]">Request Contact</h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">We'll share your details with {provider.fullName}</p>

            {!user && (
              <div className="mt-4 rounded-xl bg-[#eff6ff] p-3 text-sm text-[#2563eb] font-medium">
                Sign in to contact this provider
              </div>
            )}

            {isSuccess && (
              <p className="mt-4 rounded-xl bg-green-50 border border-green-100 p-3 text-sm font-semibold text-green-700">
                ✅ Request sent successfully
              </p>
            )}

            <form action={createContactRequest} className="mt-4">
              <fieldset
                disabled={isOwnProfile || isSuccess || isAdmin}
                className={`space-y-3 ${isOwnProfile || isSuccess || isAdmin ? "opacity-40 pointer-events-none select-none" : ""}`}
              >
                <input type="hidden" name="providerId" value={provider.id} />
                <input
                  name="name"
                  defaultValue={name}
                  placeholder="Your name"
                  className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition"
                />
                <input
                  name="email"
                  defaultValue={email}
                  placeholder="Email address"
                  className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition"
                />
                <input
                  name="phone"
                  placeholder="Phone (optional)"
                  className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition"
                />
                <textarea
                  name="message"
                  required
                  placeholder="How can they help you?"
                  className="min-h-28 w-full rounded-xl border border-black/10 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition resize-none"
                />
                <Turnstile />
                {user ? (
                  <SubmitRequestButton isSuccess={isSuccess} />
                ) : (
                  <AuthModal
                    next={`/providers/${provider.slug}`}
                    trigger={
                      <div className="w-full text-center rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-bold text-white cursor-pointer hover:bg-blue-700 transition">
                        Sign in to Contact
                      </div>
                    }
                  />
                )}
              </fieldset>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
