import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import InsightsCharts from "./InsightsCharts";


export default async function AdminInsightsPage() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });

  // Platform stats
  const { count: totalClients } = await supabase!
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client");

  const { count: totalRequests } = await supabase!
    .from("contact_requests")
    .select("*", { count: "exact", head: true });

  const { count: requestsToday } = await supabase!
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  const { count: requestsWeek } = await supabase!
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { count: requestsMonth } = await supabase!
    .from("contact_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Signups over last 7 days
  const { data: recentSignups } = await supabase!
    .from("profiles")
    .select("created_at, role")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true });

  // Most viewed providers
  const { data: topViewed } = await supabase!
    .from("provider_insights")
    .select("provider_id, count_total")
    .eq("event_type", "view_profile")
    .order("count_total", { ascending: false })
    .limit(5);

  // Most contacted providers
  const { data: topContacted } = await supabase!
    .from("provider_insights")
    .select("provider_id, count_total")
    .eq("event_type", "contact_request_sent")
    .order("count_total", { ascending: false })
    .limit(5);

  // Map provider ids to names
  const providerMap = Object.fromEntries(providers.map((p) => [String(p.id), p.fullName]));

  // Build signups chart data (last 7 days)
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#1f1f1f] sm:text-2xl">Platform Insights</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Overview of platform activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Clients", value: totalClients ?? 0 },
          { label: "Active Providers", value: activeProviders },
          { label: "Total Requests", value: totalRequests ?? 0 },
          { label: "Requests Today", value: requestsToday ?? 0 },
          { label: "Requests This Week", value: requestsWeek ?? 0 },
          { label: "Requests This Month", value: requestsMonth ?? 0 },
          { label: "Total Providers", value: providers.length },
          { label: "Pending Approval", value: providers.filter((p) => !p.approved).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#1f1f1f]">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium text-[#6b7280]">{stat.label}</p>
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