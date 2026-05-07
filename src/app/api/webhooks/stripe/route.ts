import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const status = subscription.status;
      const isActive = status === "active" || status === "trialing";

      await supabase
        .from("providers")
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: isActive ? "active" : "expired",
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      await supabase
        .from("providers")
        .update({ subscription_status: "expired" })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    case "invoice.payment_succeeded": {
      await supabase
        .from("providers")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", (event.data.object as Stripe.Invoice).customer as string);
      break;
    }

    case "invoice.payment_failed": {
      await supabase
        .from("providers")
        .update({ subscription_status: "expired" })
        .eq("stripe_customer_id", (event.data.object as Stripe.Invoice).customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}