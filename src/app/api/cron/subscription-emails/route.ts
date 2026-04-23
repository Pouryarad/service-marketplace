import { NextResponse } from "next/server";
import { sendEmailNotification } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ sent: 0, skipped: "Supabase not configured" });
  }

  const { data } = await supabase
    .from("provider_profiles")
    .select("id, email, full_name, subscription_expires_at, subscription_status")
    .in("subscription_status", ["active", "expired"]);

  const today = new Date();
  let sent = 0;

  for (const provider of data ?? []) {
    if (!provider.subscription_expires_at) continue;
    const expires = new Date(provider.subscription_expires_at);
    const days = Math.ceil((expires.getTime() - today.getTime()) / 86400000);
    const shouldNotify =
      days === 7 ||
      days === 3 ||
      provider.subscription_status === "expired" ||
      days < 0;

    if (!shouldNotify) continue;

    await sendEmailNotification({
      to: provider.email,
      subject: days < 0 ? "Your Findly subscription expired" : `Your Findly subscription expires in ${days} days`,
      html: `<p>Hi ${provider.full_name}, your provider listing ${days < 0 ? "has expired" : `expires in ${days} days`}.</p>`,
    });
    sent += 1;
  }

  return NextResponse.json({ sent });
}
