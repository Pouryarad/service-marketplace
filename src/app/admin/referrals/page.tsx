import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function AdminReferralsPage() {
  const supabase = createSupabaseServiceClient();

  // Get all referrals with referrer and referred user info
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, status, created_at, referrer_id, referred_user_id")
    .order("created_at", { ascending: false });

  // Get all providers with referral codes
  const { data: providers } = await supabase
    .from("providers")
    .select("id, full_name, email, referral_code")
    .not("referral_code", "is", null);

  // Build stats per provider
  const stats = (providers ?? []).map((p) => {
    const providerReferrals = (referrals ?? []).filter((r) => r.referrer_id === p.id);
    const confirmed = providerReferrals.filter((r) => r.status === "confirmed").length;
    const pending = providerReferrals.filter((r) => r.status === "pending").length;
    const discountPct = Math.min(confirmed * 20, 100);
    return { ...p, confirmed, pending, total: providerReferrals.length, discountPct };
  }).sort((a, b) => b.confirmed - a.confirmed);

  const totalReferrals = (referrals ?? []).length;
  const totalConfirmed = (referrals ?? []).filter((r) => r.status === "confirmed").length;
  const totalPending = (referrals ?? []).filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#0f1117]">Referrals</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">Provider referral activity and earned discounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Referrals", value: totalReferrals, cls: "bg-white" },
          { label: "Confirmed", value: totalConfirmed, cls: "bg-green-50 border border-green-100" },
          { label: "Pending", value: totalPending, cls: "bg-yellow-50 border border-yellow-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 shadow-sm ${s.cls}`}>
            <p className="text-2xl font-black text-[#0f1117]">{s.value}</p>
            <p className="text-xs text-[#9ca3af] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Provider referral table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/[0.04] overflow-hidden">
        <div className="px-5 py-4 border-b border-black/[0.06]">
          <h2 className="font-black text-[#0f1117]">By Provider</h2>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {stats.length === 0 && (
            <p className="px-5 py-8 text-sm text-[#9ca3af] text-center">No referrals yet.</p>
          )}
          {stats.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <div className="size-9 rounded-full bg-[#f0f2f7] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#6b7280]">{p.full_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#0f1117]">{p.full_name}</p>
                <p className="text-xs text-[#9ca3af] truncate">{p.email}</p>
              </div>
              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="text-center">
                  <p className="font-black text-[#0f1117]">{p.confirmed}</p>
                  <p className="text-[#9ca3af]">confirmed</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-[#9ca3af]">{p.pending}</p>
                  <p className="text-[#9ca3af]">pending</p>
                </div>
                {p.confirmed > 0 && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                    {p.discountPct}% earned
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}