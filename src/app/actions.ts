"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// =======================
// CREATE CONTACT REQUEST
// =======================
export async function createContactRequest(formData: FormData) {
  console.log("ACTION TRIGGERED");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // 📦 Get form data
  const providerId = Number(formData.get("providerId"));
  const message = String(formData.get("message") ?? "").trim();

  const name =
    String(formData.get("name") ?? "") ||
    user.user_metadata?.full_name ||
    user.email ||
    "Client";

  const email =
    String(formData.get("email") ?? "") ||
    user.email ||
    "";

  const phone = String(formData.get("phone") ?? "");

  if (!message) {
    throw new Error("Message is required");
  }
const token = formData.get("cf-turnstile-response");

if (!token) {
  throw new Error("Captcha missing");
}

const verifyRes = await fetch(
  "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
  }
);

const verifyData = await verifyRes.json();

if (!verifyData.success) {
  throw new Error("Captcha failed");
}
  // 🧠 INSERT (FIXED)
  const { error } = await supabase.from("contact_requests").insert({
    provider_id: providerId,
    client_id: user.id,
    name: name,
    email: email,
    phone: phone || null,
    message: message,
    status: "new",
  });

  if (error) {
    console.error("Contact request error:", error);
    throw new Error("Failed to create contact request");
  }

  // 📊 Track event
  const { error: eventError } = await supabase
    .from("provider_events")
    .insert({
      provider_id: providerId,
      event_type: "contact_request",
    });

  if (eventError) {
    console.error("Event tracking error:", eventError);
  }
  redirect(`/providers/${providerId}?request=success`);
}

// =======================
// TOGGLE FAVORITE
// =======================
export async function toggleFavorite(providerId: number) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("provider_id", providerId);
  } else {
    await supabase.from("favorites").insert({
      user_id: user.id,
      provider_id: providerId,
    });
  }
}