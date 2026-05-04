"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmailNotification } from "./email";
import { createSupabaseServerClient } from "./supabase/server";

export async function createContactRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/sign-in?next=/dashboard&notice=configure-supabase");
  }

  const { data: userData } = await supabase.auth.getUser();
  console.log("USER IN ACTION:", userData.user);
  if (!userData.user) {
    const providerId = String(formData.get("providerId") ?? "");
    redirect(`/auth/sign-in?next=/providers/${providerId}`);
  }

  const providerId = String(formData.get("providerId") ?? "");
  const providerName = String(formData.get("providerName") ?? "Provider");
  const clientName =
    String(formData.get("name") ?? "") ||
    userData.user.user_metadata?.full_name ||
    userData.user.email ||
    "Client";
  const clientEmail =
    String(formData.get("email") ?? "") || userData.user.email || "";
  const phone = String(formData.get("phone") ?? "");
  const message = String(formData.get("message") ?? "");

  if (!message.trim()) {
    redirect(`/providers/${providerId}?error=message-required`);
  }

  const { error } = await supabase.from("contact_requests").insert({
  provider_id: providerId,
  provider_name: providerName,
  client_id: userData.user.id,
  client_name: clientName,
  client_email: clientEmail,
  phone: phone || null,
  message,
});

if (error) {
  
  console.error("INSERT ERROR:", error);
}

  await supabase.from("notification_events").insert({
    audience: "provider",
    type: "new_request",
    title: "New contact request",
    body: `${clientName} requested contact from ${providerName}.`,
    metadata: { provider_id: providerId },
  });

  await sendEmailNotification({
    to: "admin@findly.example",
    subject: "New contact request",
    html: `<p>${clientName} requested contact from ${providerName}.</p>`,
  });

  redirect(`/providers/${providerId}?request=success`);
}

export async function saveAudienceChoice(formData: FormData) {
  const choice = String(formData.get("choice") ?? "client");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/onboarding");

  await supabase.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name ?? data.user.email,
    role: choice === "provider" ? "provider" : "client",
  });

  redirect(choice === "provider" ? "/provider/setup" : "/dashboard");
}

export async function saveProviderProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in?notice=configure-supabase");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/provider/setup");

  const fullName = String(formData.get("fullName") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!fullName.trim() || !categoryId) {
    redirect("/provider/setup?error=missing-required");
  }

  const profilePhotoFile = formData.get("profilePhoto");
  const portfolioPhotoFiles = formData.getAll("portfolioPhotos");
  const uploadBasePath = `${data.user.id}/${Date.now()}`;
  let profilePhotoUrl = String(formData.get("profilePhotoUrl") ?? "");
  const portfolioPhotoUrls = String(formData.get("portfolioPhotoUrls") ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  if (profilePhotoFile instanceof File && profilePhotoFile.size > 0) {
    const path = `${uploadBasePath}/profile-${profilePhotoFile.name}`;
    await supabase.storage.from("provider-media").upload(path, profilePhotoFile, {
      upsert: true,
      contentType: profilePhotoFile.type,
    });
    profilePhotoUrl = supabase.storage.from("provider-media").getPublicUrl(path)
      .data.publicUrl;
  }

  for (const file of portfolioPhotoFiles) {
    if (file instanceof File && file.size > 0) {
      const path = `${uploadBasePath}/portfolio-${file.name}`;
      await supabase.storage.from("provider-media").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      portfolioPhotoUrls.push(
        supabase.storage.from("provider-media").getPublicUrl(path).data.publicUrl,
      );
    }
  }

  await supabase.from("provider_profiles").upsert({
    user_id: data.user.id,
    full_name: fullName,
    business_name: String(formData.get("businessName") ?? "") || null,
    category_id: categoryId,
    profile_photo_url:
      profilePhotoUrl ||
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
    portfolio_photo_urls: portfolioPhotoUrls,
    email: String(formData.get("email") ?? data.user.email ?? ""),
    phone: String(formData.get("phone") ?? ""),
    location: String(formData.get("location") ?? ""),
    language: String(formData.get("language") ?? "English"),
    bio: String(formData.get("bio") ?? ""),
    one_line: String(formData.get("oneLine") ?? ""),
    status: "pending",
    subscription_status: "pending",
  });

  await supabase.from("notification_events").insert({
    audience: "admin",
    type: "new_provider_signup",
    title: "Provider ready for review",
    body: `${fullName} completed a provider profile.`,
  });

  await sendEmailNotification({
    to: "admin@findly.example",
    subject: "New provider signup",
    html: `<p>${fullName} completed a provider profile and is ready for review.</p>`,
  });

  redirect("/provider/dashboard?profile=pending");
}

export async function updateProviderStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin");

  const providerId = String(formData.get("providerId") ?? "");
  const status = String(formData.get("status") ?? "pending");

  await supabase
    .from("provider_profiles")
    .update({
      status,
      approved: status === "approved" || status === "active",
      suspended: status === "suspended",
      subscription_status: status === "active" ? "active" : undefined,
    })
    .eq("id", providerId);

  revalidatePath("/admin");
  revalidatePath("/provider/dashboard");
}

export async function markRequestContacted(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/provider/dashboard");

  await supabase
    .from("contact_requests")
    .update({ status: "contacted" })
    .eq("id", String(formData.get("requestId") ?? ""));

  revalidatePath("/provider/dashboard");
}

export async function subscribeProvider() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in?next=/provider/dashboard");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/provider/dashboard");

  await supabase
    .from("provider_profiles")
    .update({ subscription_status: "pending", status: "pending" })
    .eq("user_id", data.user.id);

  await supabase.from("notification_events").insert({
    audience: "admin",
    type: "new_subscription",
    title: "New subscription pending",
    body: "A provider subscription is ready for 3-day admin review.",
  });

  await sendEmailNotification({
    to: "admin@findly.example",
    subject: "New subscription pending review",
    html: "<p>A provider subscription is ready for the 3-day admin review.</p>",
  });

  revalidatePath("/provider/dashboard");
}
