import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { Users, ShieldCheck, Inbox, Tag, TrendingUp, Clock, ArrowRight } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const [providers, categoriesRes] = await Promise.all([
    getProviders({ includeHidden: true }),
    supabase!.from("categories").select("*"),
  ]);

  const { count: clientCount } = await supabase!
    .from("profiles").select("*", { count: "exact", head: true }).eq("role", "client");

  const { count: requestCount } = await supabase!
    .from("contact_requests").select("*", { count: "exact", head: true });

  const { count: requestsToday } = await supabase!
    .from("contact_requests").select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  const activeProviders = providers.filter((p) => p.approved && !p.suspended && p.subscriptionStatus === "active");
  const pendingProviders = providers.filter((p) => !p.approved && !p.suspended);
  const suspendedProviders = providers.filter((p) => p.suspended);

  const stats = [
    { label: "Clients", value: clientCount ?? 0, icon: Users, accent: "#3b82f6", href: "/admin/users?tab=clients" },
    { label: "Active Providers", value: activeProviders.length, icon: ShieldCheck, accent: "#10b981", href: "/admin/users?tab=providers" },
    { label: "Pending", value: pendingProviders.length, icon: Clock, accent: "#f59e0b", href: "/admin/approvals" },
    { label: "Suspended", value: suspendedProviders.length, icon: ShieldCheck, accent: "#ef4444", href: "/admin/approvals" },
    { label: "Total Requests", value: requestCount ?? 0, icon: Inbox, accent: "#8b5cf6", href: "/admin/insights" },
    { label: "Today", value: requestsToday ?? 0, icon: TrendingUp, accent: "#f97316", href: "/admin/insights" },
    { label: "Categories", value: categoriesRes.data?.length ?? 0, icon: Tag, accent: "#06b6d4", href: "/admin/categories" },
    { label: "All Providers", value: providers.length, icon: Users, accent: "#6b7280", href: "/admin/users?tab=providers" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#0f1117]">Overview</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">Platform at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-black/[0.04] active:scale-[0.98]">
            <div className="flex items-center justify-between mb-3">
              <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: stat.accent + "18" }}>
                <stat.icon size={16} style={{ color: stat.accent }} />
              </div>
              <ArrowRight size={12} className="text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors" />
            </div>
            <p className="text-2xl font-black text-[#0f1117]">{stat.value}</p>
            <p className="text-xs font-medium text-[#9ca3af] mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {pendingProviders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="font-bold text-amber-900 text-sm">
                {pendingProviders.length} provider{pendingProviders.length > 1 ? "s" : ""} waiting for approval
              </p>
            </div>
            <Link href="/admin/approvals"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors">
              Review all →
            </Link>
          </div>
          <div className="space-y-2">
            {pendingProviders.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#0f1117]">{p.fullName}</p>
                  <p className="text-xs text-[#9ca3af]">{p.categoryName} · {p.location}</p>
                </div>
                <Link href={`/admin/approvals/${p.id}`}
                  className="text-xs font-bold text-[#2563eb] hover:underline">Review</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Providers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-[#0f1117]">Recent Providers</h2>
          <Link href="/admin/users?tab=providers" className="text-xs font-bold text-[#2563eb]">See all →</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.04] overflow-hidden">
          {providers.slice(0, 8).map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between px-4 py-3 ${i < providers.slice(0, 8).length - 1 ? "border-b border-black/[0.04]" : ""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-full bg-[#f0f2f7] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#6b7280]">{p.fullName.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0f1117] truncate">{p.fullName}</p>
                  <p className="text-xs text-[#9ca3af] truncate">{p.categoryName}</p>
                </div>
              </div>
              <span className={`shrink-0 ml-2 rounded-full px-2.5 py-1 text-xs font-bold ${
                p.suspended ? "bg-red-100 text-red-700" :
                p.approved ? "bg-green-100 text-green-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {p.suspended ? "Suspended" : p.approved ? "Active" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}