"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmailNotification } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";


export async function createContactRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/sign-in?next=/dashboard&notice=configure-supabase");
  }

  console.log("ACTION STARTED");

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

  await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name ?? data.user.email,
      role: choice === "provider" ? "provider" : "client",
    },
    { onConflict: "id" }
  );

  redirect(choice === "provider" ? "/provider/setup" : "/dashboard");
}

export async function saveProviderProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in?notice=configure-supabase");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/provider/setup");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const rawCategory = String(formData.get("categorySlug") ?? "").trim();
  const categorySlug = rawCategory.toLowerCase().replace(/\s+/g, "-");
  const email = String(formData.get("email") ?? data.user.email ?? "");
  const phone = String(formData.get("phone") ?? "");
  const location = String(formData.get("location") ?? "");
  const language = String(formData.get("language") ?? "English");
  const oneLine = String(formData.get("oneLine") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const businessName = String(formData.get("businessName") ?? "").trim() || null;

  if (!fullName || !categorySlug || !email || !phone || !location || !oneLine) {
    redirect("/provider/setup?error=missing-required");
  }

  // Get existing provider row
  const { data: existing } = await supabase
    .from("providers")
    .select("profile_photo_url, portfolio_photo_urls, video_url, category_slug, category_approved")
    .eq("user_id", data.user.id)
    .maybeSingle();

  // Handle profile photo
  const profilePhotoFile = formData.get("profilePhoto");
  let profilePhotoUrl = String(formData.get("existingProfilePhotoUrl") ?? "");
  let pendingProfilePhotoUrl: string | null = null;

  if (profilePhotoFile instanceof File && profilePhotoFile.size > 0) {
    const path = `${data.user.id}/profile-${Date.now()}-${profilePhotoFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("provider-media")
      .upload(path, profilePhotoFile, { upsert: true, contentType: profilePhotoFile.type });

    if (!uploadError) {
      const url = supabase.storage.from("provider-media").getPublicUrl(path).data.publicUrl;
      if (existing?.profile_photo_url) {
        // Already has approved photo — put new one in pending
        pendingProfilePhotoUrl = url;
      } else {
        // First time — set directly but still pending admin approval
        pendingProfilePhotoUrl = url;
      }
    }
  }

  // Handle portfolio photos
  const portfolioFiles = formData.getAll("portfolioPhotos");
  const existingPortfolioUrls: string[] = JSON.parse(
    String(formData.get("existingPortfolioUrls") ?? "[]")
  );

  const newPortfolioUrls: string[] = [];
  for (const file of portfolioFiles) {
    if (file instanceof File && file.size > 0) {
      const path = `${data.user.id}/portfolio-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("provider-media")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!error) {
        newPortfolioUrls.push(
          supabase.storage.from("provider-media").getPublicUrl(path).data.publicUrl
        );
      }
    }
  }

  const pendingPortfolioUrls = newPortfolioUrls.length > 0 ? newPortfolioUrls : null;

  // Category approval
  const isNewCategory = !["accountant", "car-dealer", "financial-advisor",
    "immigration-consultant", "insurance-broker", "lawyer",
    "mortgage-broker", "notary-public", "realtor", "therapist", "other"
  ].includes(categorySlug);

  const pendingCategorySlug = isNewCategory ? categorySlug : null;
  const finalCategorySlug = isNewCategory
    ? (existing?.category_slug ?? categorySlug)
    : categorySlug;

  // Video approval
  const pendingVideoUrl = videoUrl !== existing?.video_url ? videoUrl : null;
  const finalVideoUrl = existing?.video_url ?? null;

  await supabase.from("providers").upsert(
    {
      user_id: data.user.id,
      full_name: fullName,
      business_name: businessName,
      category_slug: finalCategorySlug,
      pending_category_slug: pendingCategorySlug,
      profile_photo_url: profilePhotoUrl || existing?.profile_photo_url || null,
      pending_profile_photo_url: pendingProfilePhotoUrl,
      portfolio_photo_urls: existingPortfolioUrls,
      pending_portfolio_photo_urls: pendingPortfolioUrls ?? [],
      video_url: finalVideoUrl,
      pending_video_url: pendingVideoUrl,
      email,
      phone,
      location,
      language,
      bio,
      one_line: oneLine,
      approved: false,
      suspended: false,
      subscription_status: "pending",
    },
    { onConflict: "user_id" }
  );

  await sendEmailNotification({
    to: "admin@findly.example",
    subject: "Provider profile updated — needs review",
    html: `<p>${fullName} updated their profile. Please review pending items.</p>`,
  });

  redirect("/provider/dashboard?profile=saved");
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
  revalidatePath("/provider/requests");
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

export async function updateUserName(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const name = String(formData.get("name") ?? "");

  await supabase.auth.updateUser({
    data: { full_name: name },
  });
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const full_name = String(formData.get("full_name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const city = String(formData.get("city") ?? "");

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name,
      phone,
      city,
    },
    { onConflict: "id" }
  );

  revalidatePath("/dashboard/settings");
}

export async function requestAccountDelete() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await sendEmailNotification({
    to: "info@profinly.com",
    subject: "Account Deletion Request",
    html: `
      <p>User requested account deletion:</p>
      <p>Email: ${user.email}</p>
      <p>User ID: ${user.id}</p>
    `,
  });

  redirect("/dashboard/settings?delete=requested");
}