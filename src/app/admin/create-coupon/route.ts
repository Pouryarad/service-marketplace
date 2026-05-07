import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { name, code, type, value, duration, months, maxUses } = await req.json();

  const couponData: Stripe.CouponCreateParams = {
    name,
    duration,
    ...(type === "percent" ? { percent_off: value } : { amount_off: Math.round(value * 100), currency: "cad" }),
    ...(duration === "repeating" ? { duration_in_months: months } : {}),
    ...(maxUses ? { max_redemptions: maxUses } : {}),
  };

  const coupon = await stripe.coupons.create(couponData);

  if (code) {
    await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
    });
  }

  return NextResponse.json({ success: true, couponId: coupon.id });
}