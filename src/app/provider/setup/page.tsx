import { getCurrentProviderProfile, getCurrentUser } from "@/lib/data";
import ProviderSetupForm from "@/components/ProviderSetupForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProviderSetupPage() {
  const [provider, user] = await Promise.all([
    getCurrentProviderProfile(),
    getCurrentUser(),
  ]);

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          {provider && (
            <Link
              href="/provider/dashboard"
              className="grid size-9 place-items-center rounded-full hover:bg-white transition"
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#1f1f1f]">
              {provider ? "Edit Profile" : "Complete Your Profile"}
            </h1>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              {provider
                ? "Update your business details."
                : "Fill in your details to get listed and start receiving leads."}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <ProviderSetupForm
            provider={provider}
            userEmail={user?.email ?? ""}
          />
        </div>

      </section>
    </main>
  );
}