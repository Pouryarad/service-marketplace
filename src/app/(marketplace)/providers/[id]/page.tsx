import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Star } from "lucide-react";
import { TopNav } from "@/components/nav";
import { createContactRequest } from "@/lib/actions";
import { getCurrentUser, getProvider } from "@/lib/data";
import FavButton from "@/components/FavButton";
import AuthModal from "@/components/AuthModal";
import ContactButton from "@/components/ContactButton";

export default async function ProviderProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ request?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [provider, user] = await Promise.all([getProvider(id), getCurrentUser()]);

  if (!provider) {
    return (
      <main className="min-h-screen bg-[#f3f5f9]">
        
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold">Provider not found</h1>
          <Link className="mt-5 inline-flex rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white" href="/">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const photos = [provider.profilePhotoUrl, ...provider.portfolioPhotoUrls].filter(Boolean);
  const name = user?.user_metadata?.full_name ?? "";
  const email = user?.email ?? "";

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[8px] bg-white">
            <Image
              src={photos[0]}
              alt=""
              width={900}
              height={520}
              className="h-[420px] w-full object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {photos.slice(1, 4).map((photo) => (
              <Image
                key={photo}
                src={photo}
                alt=""
                width={300}
                height={160}
                className="h-32 w-full rounded-[8px] object-cover"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[8px] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#2563eb]">{provider.categoryName}</p>
                <h1 className="mt-2 font-display text-4xl font-bold">{provider.fullName}</h1>
                <p className="mt-2 text-[#6b7280]">
                  <span className="text-[#6b7280]">
                    {provider.location}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-[#2563eb] font-medium">
                    {provider.language}
                  </span>
                </p>
              </div>
              <FavButton />
            </div>
            {provider.businessName && (
              <p className="mt-4 font-semibold text-[#1f1f1f]">{provider.businessName}</p>
            )}

            <p className="mt-3 text-sm text-[#4b5563] leading-relaxed">
              {provider.bio}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {user ? (
                <>
                    <ContactButton type="email" value={provider.email} />
                    <ContactButton type="phone" value={provider.phone} />
                  </>
                ) : (
                <>
                  <AuthModal
                  trigger={
                    <div className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white cursor-pointer">
                      <Mail size={18} /> Email (Sign in)
                    </div>
                  }
                />

                <AuthModal
                  trigger={
                    <div className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white cursor-pointer">
                      <Phone size={18} /> Phone (Sign in)
                    </div>
                  }
/>
                </>
              )}
            </div>
          </section>

          <section className="rounded-[8px] bg-white p-6">
            <h2 className="font-display text-2xl font-bold">Request Contact</h2>
            {!user && (
              <div className="mt-4 rounded-[8px] border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 text-sm text-[#1f1f1f]">
                Sign in to contact this provider. You’ll be redirected back to this profile after login.
              </div>
            )}
            {query.request === "success" && (
              <p className="mt-4 rounded-[8px] bg-[#22c55e]/10 p-3 text-sm font-semibold text-[#15803d]">
                Request sent. The provider has been notified.
              </p>
            )}
            <form action={createContactRequest} className="mt-4 space-y-3">
              <input type="hidden" name="providerId" value={provider.id} />
              <input type="hidden" name="providerName" value={provider.businessName ?? provider.fullName} />
              <input name="name" defaultValue={name} placeholder="Name" className="h-12 w-full rounded-[8px] border border-black/10 px-3" />
              <input name="email" defaultValue={email} placeholder="Email" className="h-12 w-full rounded-[8px] border border-black/10 px-3" />
              <input name="phone" placeholder="Phone (optional)" className="h-12 w-full rounded-[8px] border border-black/10 px-3" />
              <textarea name="message" required placeholder="Message" className="min-h-32 w-full rounded-[8px] border border-black/10 p-3" />
              {user ? (
              <button className="w-full rounded-full bg-[#ff8a00] px-5 py-3 font-bold text-white">
                Request Contact
              </button>
            ) : (
              <Link
                href={`/auth/sign-in?next=/providers/${provider.id}`}
                className="block w-full text-center rounded-full bg-[#ff8a00] px-5 py-3 font-bold text-white"
              >
                Sign in to Contact
              </Link>
            )}
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
