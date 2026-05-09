import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { couponId, promoCodeId } = await req.json();
    if (promoCodeId) {
      await stripe.promotionCodes.update(promoCodeId, { active: false });
    } else if (couponId) {
      await stripe.coupons.del(couponId);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}