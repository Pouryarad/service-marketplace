import { getCurrentProviderProfile, getCurrentUser } from "@/lib/data";
import ProviderSetupForm from "@/components/ProviderSetupForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProviderSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "payment" ? "payment" : "profile";

  const [provider, user] = await Promise.all([
    getCurrentProviderProfile(),
    getCurrentUser(),
  ]);

  const isFirstTime = !provider;

  // Check if profile is complete enough to unlock payment tab
  const profileComplete = !!(
    provider?.fullName &&
    provider?.categorySlug &&
    provider?.email &&
    provider?.phone &&
    provider?.location &&
    provider?.language &&
    provider?.oneLine &&
    provider?.profilePhotoUrl
  );

  return (
    <main className="min-h-screen bg-[#f3f5f9] overflow-x-hidden">
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
              {isFirstTime ? "Complete Your Profile" : "Edit Profile"}
            </h1>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              {isFirstTime
                ? "Fill in your details to get listed and start receiving leads."
                : "Update your business details."}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-full bg-white p-1 shadow-sm w-fit">
          <Link
            href="/provider/setup?tab=profile"
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab === "profile"
              ? "bg-[#2563eb] text-white"
              : "text-[#6b7280] hover:text-[#1f1f1f]"
              }`}
          >
            Edit Profile
          </Link>
          <div className={`relative ${!profileComplete ? "cursor-not-allowed" : ""}`}>
            <Link
              href={profileComplete ? "/provider/setup?tab=payment" : "#"}
              className={`px-5 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${activeTab === "payment"
                ? "bg-[#2563eb] text-white"
                : profileComplete
                  ? "text-[#6b7280] hover:text-[#1f1f1f]"
                  : "text-[#d1d5db] pointer-events-none"
                }`}
            >
              Payment
              {!profileComplete && (
                <span className="text-[10px] bg-[#f3f5f9] text-[#9ca3af] px-1.5 py-0.5 rounded-full font-medium">
                  Complete profile first
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          {activeTab === "profile" ? (
            <ProviderSetupForm
              provider={provider}
              userEmail={user?.email ?? ""}
            />
          ) : profileComplete ? (
            <PaymentTab provider={provider} />
          ) : null}
        </div>

      </section>
    </main>
  );
}

function PaymentTab({ provider }: { provider: { subscriptionStatus: string; adminGranted?: boolean; adminGrantedExpiresAt?: string | null } | null }) {
  const isSubscribed = provider?.subscriptionStatus === "active";
  const isAdminGranted = provider?.adminGranted;

  if (isAdminGranted) {
    const expiresAt = provider?.adminGrantedExpiresAt;
    return (
      <div className="text-center py-8">
        <p className="text-2xl">🎉</p>
        <h2 className="mt-2 text-lg font-bold text-[#1f1f1f]">Free Access Granted</h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Your account has been activated by an admin.
          {expiresAt && (
            <span className="block mt-1 font-semibold text-amber-600">
              Access expires on {new Date(expiresAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
          {!expiresAt && <span className="block mt-1 text-green-600 font-semibold">Permanent access.</span>}
        </p>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl">✅</p>
        <h2 className="mt-2 text-lg font-bold text-[#1f1f1f]">{"You're subscribed"}</h2>
        <p className="mt-1 text-sm text-[#6b7280]">Your subscription is active.</p>
        <Link
          href="/api/stripe/portal"
          className="mt-4 inline-flex rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
        >
          Manage Subscription
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#1f1f1f]">Choose Your Plan</h2>
      <p className="mt-1 text-sm text-[#6b7280]">14-day free trial. Cancel anytime.</p>

      <div className="mt-6 rounded-2xl border-2 border-[#2563eb] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-[#1f1f1f]">ProFindly Early Bird</p>
            <p className="text-xs text-[#6b7280] mt-0.5">First 100 providers — locked in forever</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#2563eb]">$10.99</p>
            <p className="text-xs text-[#9ca3af]">CAD / month</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-[#4b5563]">
          <li>✅ Listed in ProFindly directory</li>
          <li>✅ Unlimited contact requests</li>
          <li>✅ Profile insights & analytics</li>
          <li>✅ 14-day free trial</li>
          <li>✅ Cancel anytime</li>
        </ul>

        <form action="/api/stripe/checkout" method="POST">
          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700 transition"
          >
            Start Free Trial
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-[#9ca3af]">
        No charge for 14 days. Card required to start trial.
      </p>
    </div>
  );
}