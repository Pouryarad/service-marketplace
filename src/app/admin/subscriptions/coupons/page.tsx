import Stripe from "stripe";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CouponList from "../CouponList";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function CouponsPage() {
  const [coupons, promoCodes] = await Promise.all([
    stripe.coupons.list({ limit: 100 }),
    stripe.promotionCodes.list({ limit: 100 }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/subscriptions"
          className="size-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center hover:bg-[#f0f2f7] transition shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0f1117]">Coupon Codes</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">{coupons.data.length} total coupons</p>
        </div>
      </div>

      <CouponList
        coupons={coupons.data.map((c) => ({
          id: c.id,
          name: c.name ?? c.id,
          discount: c.percent_off ? `${c.percent_off}% off` : `$${((c.amount_off ?? 0) / 100).toFixed(2)} off`,
          duration: c.duration === "repeating" ? `${c.duration_in_months} months` : c.duration,
          timesRedeemed: c.times_redeemed,
          maxRedemptions: c.max_redemptions ?? null,
          valid: c.valid,
          promoCodes: promoCodes.data
            .filter((p) => (p as any).promotion?.coupon === c.id)
            .map((p) => ({
              id: p.id,
              code: p.code,
              active: p.active,
              timesRedeemed: p.times_redeemed,
              maxRedemptions: p.max_redemptions ?? null,
              expiresAt: p.expires_at ? new Date(p.expires_at * 1000).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : null,
            })),
        }))}
      />
    </div>
  );
}