import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect("/auth/sign-in");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_customer_id, early_bird")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) return NextResponse.json({ error: "No provider" }, { status: 404 });

  // Check early bird eligibility
  const { count } = await supabase
    .from("providers")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  const isEarlyBird = (count ?? 0) < 100;
  const priceId = isEarlyBird
    ? process.env.STRIPE_EARLY_BIRD_PRICE_ID!
    : process.env.STRIPE_STANDARD_PRICE_ID!;

  // Create or reuse Stripe customer
  let customerId = provider.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { provider_id: String(provider.id) },
    });
    customerId = customer.id;
    await supabase
      .from("providers")
      .update({ stripe_customer_id: customerId, early_bird: isEarlyBird })
      .eq("id", provider.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/setup?tab=payment`,
    allow_promotion_codes: true,
  });

  return NextResponse.redirect(session.url!, 303);
}