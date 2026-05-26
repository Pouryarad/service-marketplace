import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  sendTrialStartedEmail,
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

      const isActive = subscription.status === "active" || subscription.status === "trialing";
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
      const isActive = subscription.status === "active" || subscription.status === "trialing";

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

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("providers")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", customerId);

      if (invoice.billing_reason === "subscription_cycle") {
        const provider = await getProvider(customerId);
        if (provider?.email) {
          await sendSubscriptionActiveEmail({
            providerEmail: provider.email,
            providerName: provider.full_name,
          });
        }
      }

      const { data: paidProvider } = await supabase
        .from("providers")
        .select("id, user_id, stripe_subscription_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (paidProvider) {
        const { data: referral } = await supabase
          .from("referrals")
          .update({ status: "confirmed" })
          .eq("referred_user_id", paidProvider.user_id)
          .eq("status", "pending")
          .select("referrer_id")
          .maybeSingle();

        if (referral) {
          const { count } = await supabase
            .from("referrals")
            .select("id", { count: "exact" })
            .eq("referrer_id", referral.referrer_id)
            .eq("status", "confirmed");

          const discountPct = Math.min((count ?? 1) * 20, 100);

          const { data: referrer } = await supabase
            .from("providers")
            .select("stripe_subscription_id")
            .eq("id", referral.referrer_id)
            .maybeSingle();

          if (referrer?.stripe_subscription_id) {
            const coupon = await stripe.coupons.create({
              percent_off: discountPct,
              duration: "once",
              name: `Referral Reward ${discountPct}%`,
            });
            await stripe.subscriptions.update(referrer.stripe_subscription_id, {
              discounts: [{ coupon: coupon.id }],
            });
          }
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