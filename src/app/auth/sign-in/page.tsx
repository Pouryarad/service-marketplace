import Link from "next/link";
import { Logo } from "@/components/logo";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/onboarding";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f5f9] px-4">
      <section className="w-full max-w-md rounded-[8px] bg-white p-6 text-center">
        <Logo centered />
        <h1 className="mt-8 font-display text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          One account for clients, providers, and admins.
        </p>
        {params.notice === "configure-supabase" && (
          <p className="mt-4 rounded-[8px] bg-[#ff8a00]/10 p-3 text-sm font-semibold text-[#9a5200]">
            Add Supabase environment variables to enable auth and saving.
          </p>
        )}
        <div className="mt-6">
          <Link
            href={`/auth/login?provider=google&next=${encodeURIComponent(next)}`}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/10 font-bold hover:bg-[#f3f5f9] transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Link>
        </div>
      </section>
    </main>
  );
}
