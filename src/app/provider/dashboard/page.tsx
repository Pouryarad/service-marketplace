import Link from "next/link";
import Image from "next/image";
import { Inbox, TrendingUp, UserCircle, BadgeCheck } from "lucide-react";
import { markRequestContacted, subscribeProvider, checkAndRevokeExpiredAccess, stopImpersonation } from "@/lib/actions";
import { getProviderRequests, getCurrentProviderProfile, getProviderInsights } from "@/lib/data";
import { redirect } from "next/navigation";
import InsightsChart from "@/components/InsightsChart";
import DashboardRefresh from "@/components/DashboardRefresh";
import FadeBanner from "@/components/FadeBanner";
import DashboardRequests from "@/components/DashboardRequests";
import RoleConflictModal from "@/components/RoleConflictModal";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RefBtn from "@/components/ReferralButton";



export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string; subscribed?: string }>;
}) {
  const { profile, subscribed } = await searchParams;

  const [provider, requests] = await Promise.all([
    getCurrentProviderProfile(),
    getProviderRequests(),
  ]);

  if (!provider) redirect("/provider/setup");
const cookieStore = await cookies();
const impersonatingId = cookieStore.get("impersonating_provider_id")?.value;
const supabase = await createSupabaseServerClient();
const { data: { user: currentUser } } = await supabase!.auth.getUser();
const { data: currentProfile } = await supabase!.from("profiles").select("role").eq("id", currentUser?.id ?? "").single();
const isImpersonating = !!impersonatingId && currentProfile?.role === "admin";
  if (provider.adminGranted && provider.adminGrantedExpiresAt) {
    await checkAndRevokeExpiredAccess(Number(provider.id));
  }

  const insights = await getProviderInsights(Number(provider.id));

  const openRequests = requests.filter((r) => r.status === "new");
  const displayRequests = openRequests;
  const totalLeads = requests.length;

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    approved: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600",
    expired: "bg-orange-100 text-orange-700",
  };

  const subColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    expired: "bg-red-100 text-red-700",
    none: "bg-gray-100 text-gray-600",
  };

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <RoleConflictModal actualRole="provider" />
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        {isImpersonating && (
          <div className="mb-4 rounded-2xl border border-blue-300 bg-blue-50 px-5 py-3 text-sm font-medium text-blue-700 flex items-center justify-between gap-3">
            <span>👁 Impersonating <strong>{provider.fullName}</strong> — changes are real</span>
            <Link href="/api/impersonate/stop" className="shrink-0 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition">
              Exit
            </Link>
          </div>
        )}
        {profile === "saved" && <FadeBanner message="✅ Profile saved successfully." type="green" />}
        {subscribed === "true" && <FadeBanner message="🎉 Welcome to ProFindly! Your 14-day free trial has started." type="blue" />}
        {provider.approved && !provider.adminGranted && provider.subscriptionStatus !== "active" && provider.subscriptionStatus !== "trialing" && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-700 flex items-center justify-between gap-3">
            <span>✅ Your account is approved! Activate your subscription to go live.</span>
            <Link href="/provider/setup?tab=payment" className="shrink-0 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition">
              Go to Payment →
            </Link>
          </div>
        )}
        <DashboardRefresh />
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {provider.referralCode && (
            <div className="flex justify-end sm:hidden">
              <RefBtn code={provider.referralCode!} />
            </div>
          )}
          <div className="flex items-center gap-4">
            {provider.profilePhotoUrl ? (
              <Image
                src={provider.profilePhotoUrl}
                alt={provider.fullName}
                width={128}
                height={128}
                className="size-16 rounded-full object-cover object-center ring-4 ring-white shadow-md"
              />
            ) : (
              <div className="size-16 rounded-full bg-[#2563eb] flex items-center justify-center shadow-md ring-4 ring-white" style={{ minWidth: "64px", minHeight: "64px" }}>                <span className="text-xl font-bold text-white">
                {provider.fullName.charAt(0).toUpperCase()}
              </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#1f1f1f] sm:text-3xl">
                {provider.fullName}
              </h1>
              {provider.businessName && (
                <p className="mt-0.5 text-sm font-medium text-[#6b7280]">{provider.businessName}</p>
              )}
            </div>
          </div>
          {provider.referralCode && (
            <div className="hidden sm:flex items-center">
              <RefBtn code={provider.referralCode!} />
            </div>
          )}
        </div>

        {/* Stat bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Today's Views" value={insights?.profileViews.count_day ?? 0} />
          <StatCard label="Week Views" value={insights?.profileViews.count_week ?? 0} />
          <StatCard label="Month Views" value={insights?.profileViews.count_month ?? 0} />
          <StatCard label="Total Leads" value={totalLeads} highlight />
        </div>

        {/* Main grid */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">

          {/* Insights — takes 2 cols */}
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#2563eb]" />
              <h2 className="font-bold text-[#1f1f1f]">Insights</h2>
            </div>
            <p className="mt-1 text-xs text-[#9ca3af]">
              Profile views and lead activity overview.
            </p>
            <div className="mt-5">
              <InsightsChart
                profileViews={insights?.profileViews ?? { count_day: 0, count_week: 0, count_month: 0, count_total: 0 }}
                emailReveals={insights?.emailReveals ?? { count_day: 0, count_week: 0, count_month: 0, count_total: 0 }}
                phoneReveals={insights?.phoneReveals ?? { count_day: 0, count_week: 0, count_month: 0, count_total: 0 }}
                contactRequests={insights?.contactRequests ?? { count_day: 0, count_week: 0, count_month: 0, count_total: 0 }}
              />
            </div>
          </section>

          {/* Right panel */}
          <div className="flex flex-col gap-4">

            {/* Profile Status */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-[#ff8a00]" />
                <h2 className="font-bold text-[#1f1f1f]">Status</h2>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#6b7280]">Profile</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusColor[provider.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {provider.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#6b7280]">Subscription</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${subColor[provider.subscriptionStatus] ?? "bg-gray-100 text-gray-600"}`}>
                    {provider.subscriptionStatus}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#9ca3af]">
                Visible when approved, active, and subscribed.
              </p>
            </section>

            {/* Quick actions */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-bold text-[#1f1f1f]">Quick Actions</h2>
              <div className="mt-3 space-y-1">
                <Link
                  href="/provider/setup"
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#f3f5f9] transition"
                >
                  <UserCircle size={18} className="text-[#2563eb]" />
                  <span className="text-sm font-medium text-[#1f1f1f]">Edit Profile</span>
                </Link>
                <Link
                  href={`/providers/${provider.slug}`}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#f3f5f9] transition"
                >
                  <UserCircle size={18} className="text-[#ff8a00]" />
                  <span className="text-sm font-medium text-[#1f1f1f]">View Public Profile</span>
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Contact Requests */}
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox size={18} className="text-[#2563eb]" />
              <h2 className="font-bold text-[#1f1f1f]">New Requests</h2>
            </div>
            {openRequests.length > 0 && (
              <span className="rounded-full bg-[#2563eb] px-2.5 py-0.5 text-xs font-bold text-white">
                {openRequests.length} new
              </span>
            )}
          </div>

          <DashboardRequests requests={requests} />
          {requests.length > 0 && (
            <Link
              href="/provider/requests"
              className="block rounded-xl border border-black/10 p-3 text-center text-sm font-bold text-[#2563eb] transition hover:bg-[#f3f5f9]"
            >
              View all {requests.length} requests →
            </Link>
          )}
        </section>

      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${highlight ? "bg-[#2563eb] text-white" : "bg-white"}`}>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : "text-[#1f1f1f]"}`}>
        {value}
      </p>
      <p className={`mt-1 text-xs font-medium ${highlight ? "text-blue-100" : "text-[#9ca3af]"}`}>
        {label}
      </p>
    </div>
  );
}