import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect("/auth/sign-in");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: provider } = await supabase
    .from("providers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider?.stripe_customer_id) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/provider/setup?tab=payment`);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: provider.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/setup?tab=payment`,
  });

  return NextResponse.redirect(session.url, 303);
}