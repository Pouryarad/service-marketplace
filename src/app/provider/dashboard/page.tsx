import Link from "next/link";
import Image from "next/image";
import { Inbox, TrendingUp, UserCircle, BadgeCheck } from "lucide-react";
import { markRequestContacted, subscribeProvider } from "@/lib/actions";
import { getProviderRequests, getCurrentProviderProfile, getProviderInsights } from "@/lib/data";
import { redirect } from "next/navigation";
import InsightsChart from "@/components/InsightsChart";

export default async function ProviderDashboardPage() {
  const [provider, requests] = await Promise.all([
    getCurrentProviderProfile(),
    getProviderRequests(),
  ]);

  if (!provider) redirect("/provider/setup");

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
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              <div className="mt-3">
                <Link
                  href="/provider/setup"
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#f3f5f9] transition"
                >
                  <UserCircle size={18} className="text-[#2563eb]" />
                  <span className="text-sm font-medium text-[#1f1f1f]">Edit Profile</span>
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

          <div className="mt-4 space-y-3">
            {displayRequests.length === 0 ? (
              <p className="text-sm text-[#9ca3af]">No new requests.</p>
            ) : (
              <>
                {displayRequests.slice(0, 2).map((request) => (
                  <article
                    key={request.id}
                    className="rounded-xl border border-[#2563eb]/15 bg-[#eff6ff] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#1f1f1f]">{request.clientName}</p>
                          <span className="rounded-full bg-[#2563eb] px-2 py-0.5 text-[10px] font-bold text-white">
                            New
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#6b7280]">
                          {request.clientEmail}
                          {request.phone ? ` · ${request.phone}` : ""}
                        </p>
                        <p className="mt-2 text-sm text-[#1f1f1f]">{request.message}</p>
                      </div>
                      <form action={markRequestContacted}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button className="whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-[#1f1f1f] transition hover:bg-[#f3f5f9]">
                          Mark contacted
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
                {requests.length > 0 && (
                  <Link
                    href="/provider/requests"
                    className="block rounded-xl border border-black/10 p-3 text-center text-sm font-bold text-[#2563eb] transition hover:bg-[#f3f5f9]"
                  >
                    View all {requests.length} requests →
                  </Link>
                )}
              </>
            )}
          </div>
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