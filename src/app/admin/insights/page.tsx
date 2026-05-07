import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import InsightsCharts from "./InsightsCharts";

export default async function AdminInsightsPage() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });

  const [
    { count: totalClients },
    { count: totalRequests },
    { count: requestsToday },
    { count: requestsWeek },
    { count: requestsMonth },
    { data: recentSignups },
    { data: topViewed },
    { data: topContacted },
  ] = await Promise.all([
    supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase!.from("contact_requests").select("*", { count: "exact", head: true }),
    supabase!.from("contact_requests").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase!.from("contact_requests").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase!.from("contact_requests").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase!.from("profiles").select("created_at, role").gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()).order("created_at", { ascending: true }),
    supabase!.from("provider_insights").select("provider_id, count_total").eq("event_type", "view_profile").order("count_total", { ascending: false }).limit(5),
    supabase!.from("provider_insights").select("provider_id, count_total").eq("event_type", "contact_request_sent").order("count_total", { ascending: false }).limit(5),
  ]);

  const providerMap = Object.fromEntries(providers.map((p) => [String(p.id), p.fullName]));

  const signupsByDay: Record<string, { clients: number; providers: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    signupsByDay[key] = { clients: 0, providers: 0 };
  }
  recentSignups?.forEach((s) => {
    const key = new Date(s.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    if (signupsByDay[key]) {
      if (s.role === "client") signupsByDay[key].clients++;
      else if (s.role === "provider") signupsByDay[key].providers++;
    }
  });
  const signupChartData = Object.entries(signupsByDay).map(([label, v]) => ({ label, ...v }));
  const activeProviders = providers.filter((p) => p.approved && !p.suspended && p.subscriptionStatus === "active").length;

  const stats = [
    { label: "Total Clients", value: totalClients ?? 0 },
    { label: "Active Providers", value: activeProviders },
    { label: "Total Requests", value: totalRequests ?? 0 },
    { label: "Requests Today", value: requestsToday ?? 0 },
    { label: "This Week", value: requestsWeek ?? 0 },
    { label: "This Month", value: requestsMonth ?? 0 },
    { label: "All Providers", value: providers.length },
    { label: "Pending", value: providers.filter((p) => !p.approved).length },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#0f1117]">Insights</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">Platform activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
            <p className="text-3xl font-black text-[#0f1117]">{s.value}</p>
            <p className="mt-1 text-xs font-medium text-[#9ca3af]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <InsightsCharts
        signupChartData={signupChartData}
        topViewed={(topViewed ?? []).map((r) => ({ name: providerMap[String(r.provider_id)] ?? "Unknown", value: r.count_total }))}
        topContacted={(topContacted ?? []).map((r) => ({ name: providerMap[String(r.provider_id)] ?? "Unknown", value: r.count_total }))}
      />
    </div>
  );
}
