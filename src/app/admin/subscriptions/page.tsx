import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { grantAdminAccess } from "@/lib/actions";
import Stripe from "stripe";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import DiscountCodeForm from "./DiscountCodeForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function AdminSubscriptionsPage() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });
  const coupons = await stripe.coupons.list({ limit: 20 });

  const activeProviders = providers.filter((p) => p.subscriptionStatus === "active");
  const trialingProviders = providers.filter((p) => (p as any).subscriptionStatus === "trialing");
  const expiredProviders = providers.filter((p) => !p.subscriptionStatus || p.subscriptionStatus === "expired");
  const adminGranted = providers.filter((p) => (p as any).admin_granted);

  const stats = [
    { label: "Active", value: activeProviders.length, cls: "bg-green-100 text-green-700" },
    { label: "Trialing", value: trialingProviders.length, cls: "bg-blue-100 text-blue-700" },
    { label: "Expired", value: expiredProviders.length, cls: "bg-red-100 text-red-700" },
    { label: "Free Access", value: adminGranted.length, cls: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#0f1117]">Subscriptions</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">Provider plans and discount codes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>
            <p className="mt-2 text-3xl font-black text-[#0f1117]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Discount Codes */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-[#0f1117]">Discount Codes</h2>
          <Link href="https://dashboard.stripe.com/coupons" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline">
            Stripe <ExternalLink size={11} />
          </Link>
        </div>

        <DiscountCodeForm />

        {coupons.data.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Existing</p>
            {coupons.data.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3">
                <div>
                  <p className="font-bold text-sm text-[#0f1117]">{c.name ?? c.id}</p>
                  <p className="text-xs text-[#9ca3af]">
                    {c.percent_off ? `${c.percent_off}% off` : `$${(c.amount_off ?? 0) / 100} off`}
                    {" · "}{c.duration === "repeating" ? `${c.duration_in_months}mo` : c.duration}
                    {c.max_redemptions ? ` · Max ${c.max_redemptions}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.valid ? "bg-green-100 text-green-700" : "bg-[#f0f2f7] text-[#9ca3af]"}`}>
                  {c.valid ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Providers List */}
      <div>
        <h2 className="font-black text-[#0f1117] mb-3">All Providers</h2>
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#f0f2f7] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#6b7280]">{p.fullName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-[#0f1117]">{p.fullName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      p.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                      (p as any).subscriptionStatus === "trialing" ? "bg-blue-100 text-blue-700" :
                      (p as any).admin_granted ? "bg-purple-100 text-purple-700" :
                      "bg-[#f0f2f7] text-[#9ca3af]"
                    }`}>
                      {(p as any).admin_granted ? "Free Access" : p.subscriptionStatus ?? "None"}
                    </span>
                    {(p as any).early_bird && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">🐦 Early Bird</span>
                    )}
                  </div>
                  <p className="text-xs text-[#9ca3af] truncate mt-0.5">{p.email}</p>
                </div>

                {!(p as any).admin_granted && (
                  <form action={grantAdminAccess}>
                    <input type="hidden" name="providerId" value={p.id} />
                    <button className="shrink-0 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition-all">
                      Grant Free
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
