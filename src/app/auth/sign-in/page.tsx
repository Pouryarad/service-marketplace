import Link from "next/link";
import { Apple } from "lucide-react";
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
        <div className="mt-6 grid gap-3">
          <Link
            href={`/auth/login?provider=google&next=${encodeURIComponent(next)}`}
            className="flex h-12 items-center justify-center gap-3 rounded-full border border-black/10 font-bold"
          >
            <span className="font-display text-lg">G</span>
            Continue with Google
          </Link>
          <Link
            href={`/auth/login?provider=apple&next=${encodeURIComponent(next)}`}
            className="flex h-12 items-center justify-center gap-3 rounded-full bg-[#1f1f1f] font-bold text-white"
          >
            <Apple size={19} />
            Continue with Apple
          </Link>
        </div>
      </section>
    </main>
  );
}
