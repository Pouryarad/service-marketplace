import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { name, code, type, value, duration, months, maxUses, redeemBy } = await req.json();

    const coupon = await stripe.coupons.create({
      name,
      duration,
      ...(type === "percent" ? { percent_off: value } : { amount_off: Math.round(value * 100), currency: "cad" }),
      ...(duration === "repeating" ? { duration_in_months: months } : {}),
      ...(maxUses ? { max_redemptions: maxUses } : {}),
    });

    if (code) {
      const body: Record<string, any> = {
        "promotion[type]": "coupon",
        "promotion[coupon]": coupon.id,
        "code": code,
      };
      if (maxUses) body.max_redemptions = Number(maxUses);
      if (redeemBy) body.expires_at = Math.floor(new Date(redeemBy).getTime() / 1000);

      const promoRes = await fetch(`https://api.stripe.com/v1/promotion_codes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2026-04-22.dahlia",
        },
        body: new URLSearchParams(
          Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)]))
        ).toString(),
      });
      const promoJson = await promoRes.json();
      console.log("Promo code creation result:", JSON.stringify(promoJson));
    }

    return NextResponse.json({ success: true, couponId: coupon.id });
  } catch (err: any) {
    console.error("Create coupon error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}