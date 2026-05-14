"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  sendEmailNotification,
  sendNewContactRequestEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendAccountSuspendedEmail,
  sendReferralInviteEmail
} from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function createContactRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/sign-in?next=/dashboard&notice=configure-supabase");
  }


  const { data: userData } = await supabase.auth.getUser();


  if (!userData.user) {
    const providerId = String(formData.get("providerId") ?? "");
    redirect(`/auth/sign-in?next=/providers/${providerId}`);
  }

  const providerId = String(formData.get("providerId") ?? "");

  const { data: providerRow } = await supabase
    .from("providers")
    .select("user_id")
    .eq("id", Number(providerId))
    .maybeSingle();

  if (providerRow?.user_id === userData.user.id) {
    redirect(`/providers/${providerId}?error=own-profile`);
  }

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

  await supabase.from("provider_events").insert({
    provider_id: providerId,
    event_type: "contact_request_sent",
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

  // Email the provider directly
  const { data: providerContact } = await supabase
    .from("providers")
    .select("email, full_name")
    .eq("id", Number(providerId))
    .maybeSingle();

  if (providerContact?.email) {
    await sendNewContactRequestEmail({
      providerEmail: providerContact.email,
      providerName: providerContact.full_name,
      clientName,
      clientEmail,
      clientPhone: phone || null,
      message,
    });
  }

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
      email: data.user.email,
    },
    { onConflict: "id" }
  );

  const cookieStore = await cookies();
  cookieStore.set("user-role", choice === "provider" ? "provider" : "client", { path: "/", httpOnly: false, maxAge: 60 * 60 * 24 * 30 });
  redirect(choice === "provider" ? "/provider/setup" : "/dashboard");
}

export async function saveProviderProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in?notice=configure-supabase");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/sign-in?next=/provider/setup");

  const cookieStore = await cookies();
  const impersonatingId = cookieStore.get("impersonating_provider_id")?.value;
  const isImpersonating = !!impersonatingId;

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
    .select("user_id, profile_photo_url, portfolio_photo_urls, video_url, category_slug, category_approved")
    .eq(isImpersonating ? "id" : "user_id", isImpersonating ? Number(impersonatingId) : data.user.id)
    .maybeSingle();

  const storageClient = isImpersonating ? createSupabaseServiceClient() : supabase;

  // Handle profile photo
  const profilePhotoFile = formData.get("profilePhoto");
  let profilePhotoUrl = String(formData.get("existingProfilePhotoUrl") ?? "");
  let pendingProfilePhotoUrl: string | null = null;

  if (profilePhotoFile instanceof File && profilePhotoFile.size > 0) {
    const uploadUserId = isImpersonating
      ? (existing as any)?.user_id ?? impersonatingId
      : data.user.id;
    const path = `${uploadUserId}/profile-${Date.now()}-${profilePhotoFile.name}`;
    const { error: uploadError } = await storageClient.storage
      .from("provider-media")
      .upload(path, profilePhotoFile, { upsert: true, contentType: profilePhotoFile.type });

    if (!uploadError) {
      const url = storageClient.storage.from("provider-media").getPublicUrl(path).data.publicUrl;
      if (isImpersonating) {
        profilePhotoUrl = url;
      } else if (existing?.profile_photo_url) {
        pendingProfilePhotoUrl = url;
      } else {
        profilePhotoUrl = url;
      }
    }
  }

  // Handle portfolio photos
  const portfolioFiles = formData.getAll("portfolioPhotos");
  const existingPortfolioUrls: string[] = JSON.parse(
    String(formData.get("existingPortfolioUrls") ?? "[]")
  );

  const newPortfolioUrls: string[] = (
    await Promise.all(
      portfolioFiles.map(async (file) => {
        if (!(file instanceof File) || file.size === 0) return null;
        const uploadUserId = isImpersonating
          ? (existing as any)?.user_id ?? impersonatingId
          : data.user.id;
        const path = `${uploadUserId}/portfolio-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { error } = await storageClient.storage
          .from("provider-media")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (error) return null;
        return storageClient.storage.from("provider-media").getPublicUrl(path).data.publicUrl;
      })
    )
  ).filter(Boolean) as string[];

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
  const pendingVideoUrl = videoUrl && videoUrl !== existing?.video_url ? videoUrl : null;
  const finalVideoUrl = existing?.video_url ?? null;

  const baseSlug = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: existingSlug } = await supabase
    .from("providers")
    .select("slug")
    .eq(isImpersonating ? "id" : "user_id", isImpersonating ? Number(impersonatingId) : data.user.id)
    .maybeSingle();

  const slug = existingSlug?.slug ?? `${baseSlug}-${data.user.id.slice(0, 8)}`;

  // Handle ID document upload
  const idDocument = formData.get("idDocument") as File | null;
  let idDocumentUrl: string | undefined;

  if (idDocument && idDocument.size > 0) {
    const ext = idDocument.name.split(".").pop();
    const path = `${data.user.id}/id-${Date.now()}.${ext}`;
    const serviceClient = createSupabaseServiceClient();
    const { error: idUploadError } = await serviceClient.storage
      .from("provider-ids")
      .upload(path, idDocument, { upsert: true });

    if (idUploadError) console.error("ID upload error:", idUploadError);
    if (!idUploadError) {
      const { data: urlData } = supabase.storage
        .from("provider-ids")
        .getPublicUrl(path);
      idDocumentUrl = urlData.publicUrl;
    }
  }

  const payload = {
    slug,
    ...(idDocumentUrl && { id_document_url: idDocumentUrl }),
    full_name: fullName,
    business_name: businessName,
    category_slug: finalCategorySlug,
    pending_category_slug: isImpersonating ? null : pendingCategorySlug,
    profile_photo_url: isImpersonating
      ? (profilePhotoUrl || existing?.profile_photo_url || null)
      : (profilePhotoUrl || existing?.profile_photo_url || null),
    pending_profile_photo_url: isImpersonating ? null : pendingProfilePhotoUrl,
    portfolio_photo_urls: isImpersonating
      ? [...existingPortfolioUrls, ...(pendingPortfolioUrls ?? [])]
      : existingPortfolioUrls,
    pending_portfolio_photo_urls: isImpersonating ? [] : (pendingPortfolioUrls ?? []),
    video_url: isImpersonating ? (videoUrl ?? finalVideoUrl) : finalVideoUrl,
    pending_video_url: isImpersonating ? null : pendingVideoUrl,
    email,
    phone,
    location,
    language,
    bio,
    one_line: oneLine,
    suspended: false,
  };

  if (isImpersonating) {
    await supabase.from("providers").update(payload).eq("id", Number(impersonatingId));
    revalidatePath("/provider/setup");
    revalidatePath("/provider/dashboard");
    revalidatePath("/providers/");
  } else {
    await supabase.from("providers").upsert(
      { user_id: data.user.id, ...payload, ...(existing ? {} : { approved: false, subscription_status: "pending" }) },
      { onConflict: "user_id" }
    );
    await sendEmailNotification({
      to: "admin@findly.example",
      subject: "Provider profile updated — needs review",
      html: `<p>${fullName} updated their profile. Please review pending items.</p>`,
    });
    if (!existing) {
      const refCode = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
      await supabase.from("providers").update({ referral_code: refCode }).eq("user_id", data.user.id);
    }
  }

  revalidatePath("/provider/setup");
  revalidatePath("/provider/dashboard");
  redirect(existing ? "/provider/dashboard?profile=saved" : "/provider/setup?tab=payment");
}

export async function updateProviderStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin");


  const providerId = String(formData.get("providerId") ?? "");
  const status = String(formData.get("status") ?? "pending");

  const { data: provider } = await supabase
    .from("providers")
    .update({
      approved: status === "approved",
      suspended: status === "suspended",
    })
    .eq("id", Number(providerId))
    .select("email, full_name")
    .single();

  // Send provider notification email
  if (provider?.email) {
    if (status === "approved") {
      await sendAccountApprovedEmail({
        providerEmail: provider.email,
        providerName: provider.full_name,
      });
    } else if (status === "suspended") {
      await sendAccountSuspendedEmail({
        providerEmail: provider.email,
        providerName: provider.full_name,
      });
    } else if (status === "rejected") {
      await sendAccountRejectedEmail({
        providerEmail: provider.email,
        providerName: provider.full_name,
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/users");
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

  redirect("/dashboard?settings=saved");
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

export async function createStripeCheckout() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_customer_id, early_bird")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) redirect("/provider/setup");

  // Block if already has active subscription
const { data: existingSub } = await supabase
  .from("providers")
  .select("subscription_status, stripe_subscription_id")
  .eq("id", provider.id)
  .maybeSingle();

if (existingSub?.stripe_subscription_id && 
    (existingSub.subscription_status === "active" || existingSub.subscription_status === "trialing")) {
  redirect("/provider/dashboard?already-subscribed=true");
}

  // Check if early bird (first 100 approved providers)
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

  // Create checkout session with 14-day trial
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/provider/setup?tab=payment`,
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function grantAdminAccess(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const providerId = Number(formData.get("providerId"));
  const rawDate = formData.get("expiresAt") ? String(formData.get("expiresAt")) : null;
  const expiresAt = rawDate ? `${rawDate}T23:59:59Z` : null;

  await supabase
    .from("providers")
    .update({
      admin_granted: true,
      subscription_status: "active",
      approved: true,
      admin_granted_expires_at: expiresAt ?? null,
    })
    .eq("id", providerId);

  revalidatePath("/admin/subscriptions");
}

export async function revokeAdminAccess(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const providerId = Number(formData.get("providerId"));

  await supabase
    .from("providers")
    .update({
      admin_granted: false,
      subscription_status: "expired",
    })
    .eq("id", providerId);

  revalidatePath("/admin/subscriptions");
}

export async function checkAndRevokeExpiredAccess(providerId: number) {
  "use server";
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  await supabase
    .from("providers")
    .update({ admin_granted: false, subscription_status: "expired" })
    .eq("id", providerId)
    .lt("admin_granted_expires_at", new Date().toISOString())
    .eq("admin_granted", true);
}

export async function startImpersonation(formData: FormData) {
  "use server";
  const providerId = String(formData.get("providerId"));
  redirect(`/api/impersonate?id=${providerId}`);
}

export async function stopImpersonation() {
  "use server";
  redirect("/api/impersonate/stop");
}

export async function sendReferralInvite(formData: FormData) {
  "use server";
  const toEmail = String(formData.get("email") ?? "").trim();
  const referrerName = String(formData.get("referrerName") ?? "").trim();
  const referralCode = String(formData.get("referralCode") ?? "").trim();

  if (!toEmail || !referralCode) return { error: "Missing fields" };

  await sendReferralInviteEmail({ toEmail, referrerName, referralCode });
  return { success: true };
}