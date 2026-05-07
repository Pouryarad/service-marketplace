import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  sendTrialStartedEmail,
  sendTrialEndingSoonEmail,
  sendSubscriptionActiveEmail,
  sendSubscriptionExpiredEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getProvider(customerId: string) {
  const { data } = await supabase
    .from("providers")
    .select("email, full_name, trial_ends_at")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data;
}

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

  switch (event.type) {
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("providers")
        .update({ trial_used: true })
        .eq("stripe_customer_id", customerId);

      // If trialing, send trial started email
      if (subscription.status === "trialing" && subscription.trial_end) {
        const provider = await getProvider(customerId);
        if (provider?.email) {
          await sendTrialStartedEmail({
            providerEmail: provider.email,
            providerName: provider.full_name,
            trialEndsAt: new Date(subscription.trial_end * 1000),
          });
        }
      }

      // fall through to update subscription status
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
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
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
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("providers")
        .update({ subscription_status: "expired" })
        .eq("stripe_customer_id", customerId);

      const provider = await getProvider(customerId);
      if (provider?.email) {
        await sendSubscriptionExpiredEmail({
          providerEmail: provider.email,
          providerName: provider.full_name,
        });
      }
      break;
    }

    case "customer.subscription.trial_will_end": {
      // Stripe fires this 3 days before trial ends
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      if (subscription.trial_end) {
        const provider = await getProvider(customerId);
        if (provider?.email) {
          await sendTrialEndingSoonEmail({
            providerEmail: provider.email,
            providerName: provider.full_name,
            trialEndsAt: new Date(subscription.trial_end * 1000),
          });
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("providers")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", customerId);

      // Only email on recurring payments (not the first trial invoice)
      if (invoice.billing_reason === "subscription_cycle") {
        const provider = await getProvider(customerId);
        if (provider?.email) {
          await sendSubscriptionActiveEmail({
            providerEmail: provider.email,
            providerName: provider.full_name,
          });
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("providers")
        .update({ subscription_status: "expired" })
        .eq("stripe_customer_id", customerId);

      const provider = await getProvider(customerId);
      if (provider?.email) {
        await sendPaymentFailedEmail({
          providerEmail: provider.email,
          providerName: provider.full_name,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}