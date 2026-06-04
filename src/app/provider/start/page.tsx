import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import AuthModal from "@/components/AuthModal";

export default async function ProviderStart() {
  const role = await getCurrentUserRole();

  if (role === "provider") {
    redirect("/provider/dashboard");
  }

  if (role === "client") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f3f5f9] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-xl font-bold text-[#1f1f1f]">
            You already have a client account
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Continue as a client or sign in with a different account to become a provider.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <a href="/dashboard" className="rounded-full bg-[#2563eb] px-5 py-3 font-semibold text-white">
              Continue as Client
            </a>
            <a href="/" className="rounded-full border border-black/10 px-5 py-3 font-semibold text-[#1f1f1f]">
              Go Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Not logged in — show sign up as provider
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f3f5f9] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
        <h1 className="text-xl font-bold text-[#1f1f1f]">Join as a Provider</h1>
        <p className="mt-3 text-sm text-gray-500">
          Create your provider profile and start getting clients across Canada.
        </p>
        <div className="mt-5">
          <AuthModal
            role="provider"
            next="/provider/setup"
            trigger={
              <button className="w-full rounded-full bg-[#2563eb] px-5 py-3 font-semibold text-white">
                Sign up with Google
              </button>
            }
          />
        </div>
      </div>
    </main>
  );
}