"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";


export async function createContactRequest(formData: FormData) {
    console.log("ACTION TRIGGERED");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const providerId = Number(formData.get("providerId"));
  const message = formData.get("message") as string;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  // 1. Save contact request
  const { error } = await supabase.from("contact_requests").insert({
    client_id: user.id,
    provider_id: providerId,
    message,
    name,
    email,
    phone,
  });

  if (error) {
    console.error("Contact request error:", error);
    return;
  }

  // 2. Track event (for insights)
  const { error: eventError } = await supabase
    .from("provider_events")
    .insert({
      provider_id: providerId,
      event_type: "contact_request",
    });

  if (eventError) {
    console.error("Event tracking error:", eventError);
  }
}

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
