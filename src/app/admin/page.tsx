import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { Users, ShieldCheck, Inbox, Tag, TrendingUp, Clock } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const [providers, categoriesRes] = await Promise.all([
    getProviders({ includeHidden: true }),
    supabase!.from("categories").select("*"),
  ]);

  const { count: clientCount } = await supabase!
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client");

  const { count: requestCount } = await supabase!
    .from("contact_requests")
    .select("*", { count: "exact", head: true });

  const { count: requestsToday } = await supabase!
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  const activeProviders = providers.filter((p) => p.approved && !p.suspended && p.subscriptionStatus === "active");
  const pendingProviders = providers.filter((p) => !p.approved);
  const suspendedProviders = providers.filter((p) => p.suspended);

  const stats = [
    { label: "Total Clients", value: clientCount ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Providers", value: activeProviders.length, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
    { label: "Pending Approval", value: pendingProviders.length, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Suspended", value: suspendedProviders.length, icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Requests", value: requestCount ?? 0, icon: Inbox, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Requests Today", value: requestsToday ?? 0, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Categories", value: categoriesRes.data?.length ?? 0, icon: Tag, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Total Providers", value: providers.length, icon: Users, color: "text-gray-500", bg: "bg-gray-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1f1f1f] sm:text-2xl">Overview</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Platform stats at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className={`inline-flex size-9 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1f1f1f]">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium text-[#6b7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      {pendingProviders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#1f1f1f]">
              Pending Approvals
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                {pendingProviders.length}
              </span>
            </h2>
            <Link href="/admin/approvals" className="text-xs font-bold text-[#2563eb]">View all →</Link>
          </div>
          <div className="space-y-2">
            {pendingProviders.slice(0, 3).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div>
                  <p className="font-bold text-[#1f1f1f] text-sm">{provider.fullName}</p>
                  <p className="text-xs text-[#6b7280]">{provider.categoryName} · {provider.location}</p>
                </div>
                <Link
                  href="/admin/approvals"
                  className="rounded-full bg-[#2563eb] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Providers Table */}
      <div>
        <h2 className="text-base font-bold text-[#1f1f1f] mb-3">Recent Providers</h2>
        <div className="rounded-2xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="border-b border-black/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af] hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af] hidden md:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {providers.slice(0, 10).map((provider) => (
                <tr key={provider.id} className="hover:bg-[#f3f5f9] transition">
                  <td className="px-4 py-3 font-medium text-[#1f1f1f]">{provider.fullName}</td>
                  <td className="px-4 py-3 text-[#6b7280] hidden sm:table-cell">{provider.categoryName}</td>
                  <td className="px-4 py-3 text-[#6b7280] hidden md:table-cell">{provider.location}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                      provider.suspended ? "bg-red-100 text-red-700" :
                      provider.approved ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {provider.suspended ? "Suspended" : provider.approved ? "Active" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}