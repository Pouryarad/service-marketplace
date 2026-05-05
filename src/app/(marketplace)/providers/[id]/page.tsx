import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
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
  params: Promise<{ id: string }>;
  searchParams: Promise<{ request?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const isSuccess = query.request === "success";

  const [provider, user] = await Promise.all([
    getProvider(id),
    getCurrentUser(),
  ]);

  const supabase = await createSupabaseServerClient();

  let isFav = false;

  if (supabase && user && provider) {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider_id", provider.id)
      .single();

    isFav = !!data;
  }

  if (supabase && provider) {
    await supabase.from("provider_events").insert({
      provider_id: provider.id,
      event_type: "view_profile",
    });
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-[#f3f5f9]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">Provider not found</h1>
          <Link
            className="mt-5 inline-flex rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white"
            href="/"
          >
            Back home
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

              {/* CONTACT ACTION (MAIN BUSINESS CTA) */}
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
                    next={`/providers/${provider.id}`}
                    trigger={
                      <div className="w-full text-center rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white cursor-pointer">
                        Reveal Email (Sign in)
                      </div>
                    }
                  />

                  <AuthModal
                    next={`/providers/${provider.id}`}
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
          <div className="bg-white rounded-[12px] p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {provider.bio}
            </p>
          </div>

          {/* VIDEO PLACEHOLDER */}
          <div className="bg-white rounded-[12px] p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-3">Introduction</h2>

            <div className="aspect-video rounded-[10px] bg-gray-100 flex items-center justify-center text-gray-400">
              Video coming soon
            </div>
          </div>

          {/* CONTACT BUTTONS */}
        </div>

        {/* RIGHT SIDE */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-24">

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
                disabled={isSuccess}
                className={`space-y-3 ${isSuccess ? "opacity-60 pointer-events-none" : ""
                  }`}
              >
                <input
                  type="hidden"
                  name="providerId"
                  value={provider.id}
                />

                <input
                  name="name"
                  defaultValue={name}
                  placeholder="Name"
                  className="h-12 w-full rounded-[10px] border px-3"
                />

                <input
                  name="email"
                  defaultValue={email}
                  placeholder="Email"
                  className="h-12 w-full rounded-[10px] border px-3"
                />

                <input
                  name="phone"
                  placeholder="Phone (optional)"
                  className="h-12 w-full rounded-[10px] border px-3"
                />

                <textarea
                  name="message"
                  required
                  placeholder="Message"
                  className="min-h-28 w-full rounded-[10px] border p-3"
                />
                <Turnstile />
                {user ? (
                  <SubmitRequestButton isSuccess={isSuccess} />
                ) : (
                  <AuthModal
                    next={`/providers/${provider.id}`}
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