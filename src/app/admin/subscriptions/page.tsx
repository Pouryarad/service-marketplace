import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { grantAdminAccess, revokeAdminAccess } from "@/lib/actions";
import Stripe from "stripe";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import DiscountCodeForm from "./DiscountCodeForm";
import CouponList from "./CouponList";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function AdminSubscriptionsPage() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });
  const coupons = await stripe.coupons.list({ limit: 50 });

  const activeProviders = providers.filter((p) => p.subscriptionStatus === "active");
  const trialingProviders = providers.filter((p) => (p as any).subscriptionStatus === "trialing");
  const expiredProviders = providers.filter((p) => !p.subscriptionStatus || p.subscriptionStatus === "expired");
  const adminGranted = providers.filter((p) => p.adminGranted);

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
      </div>
      <Link href="/admin/subscriptions/coupons"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-sm font-bold text-[#6b7280] hover:bg-[#f0f2f7] transition">
        View All Codes →
      </Link>
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
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                      (p as any).subscriptionStatus === "trialing" ? "bg-blue-100 text-blue-700" :
                        p.adminGranted ? "bg-purple-100 text-purple-700" :
                          "bg-[#f0f2f7] text-[#9ca3af]"
                      }`}>
                      {p.adminGranted ? "Free Access" : p.subscriptionStatus ?? "None"}
                    </span>
                    {(p as any).early_bird && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">🐦 Early Bird</span>
                    )}
                  </div>
                  <p className="text-xs text-[#9ca3af] truncate mt-0.5">{p.email}</p>
                </div>

                {p.adminGranted ? (
                  <form action={revokeAdminAccess}>
                    <input type="hidden" name="providerId" value={p.id} />
                    <button className="shrink-0 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition-all">
                      Revoke
                    </button>
                  </form>
                ) : (
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