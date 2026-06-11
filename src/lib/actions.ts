"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  sendEmailNotification,
  sendNewContactRequestEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendAccountSuspendedEmail,
  sendReferralInviteEmail,
  sendWelcomeEmail,
  sendAdminNotificationEmail,
  sendMediaApprovedEmail,
} from "@/lib/email";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createContactRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in?next=/dashboard&notice=configure-supabase");

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
  const clientEmail = String(formData.get("email") ?? "") || userData.user.email || "";
  const phone = String(formData.get("phone") ?? "");
  const message = String(formData.get("message") ?? "");

  if (!message.trim()) redirect(`/providers/${providerId}?error=message-required`);

  const { error } = await supabase.from("contact_requests").insert({
    provider_id: providerId,
    provider_name: providerName,
    client_id: userData.user.id,
    client_name: clientName,
    client_email: clientEmail,
    phone: phone || null,
    message,
  });

  if (error) console.error("INSERT ERROR:", error);

  await supabase.from("provider_events").insert({
    provider_id: providerId,
    event_type: "contact_request_sent",
  });

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
  cookieStore.set("user-role", choice === "provider" ? "provider" : "client", {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
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
  const categorySlug = rawCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const email = String(formData.get("email") ?? data.user.email ?? "");
  const phone = String(formData.get("phone") ?? "");
  const location = String(formData.get("location") ?? "");
  const language = String(formData.get("language") ?? "English");
  const oneLine = String(formData.get("oneLine") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const businessName = String(formData.get("businessName") ?? "").trim() || null;

  const uploadedProfilePhotoUrl2 = String(formData.get("uploadedProfilePhotoUrl") ?? "");
  const existingProfilePhotoUrl2 = String(formData.get("existingProfilePhotoUrl") ?? "");
  const hasPhoto = !!uploadedProfilePhotoUrl2 || !!existingProfilePhotoUrl2;

  const missingFields = [];
  if (!fullName) missingFields.push("fullName");
  if (!categorySlug) missingFields.push("categorySlug");
  if (!email) missingFields.push("email");
  if (!phone) missingFields.push("phone");
  if (!location) missingFields.push("location");
  if (!oneLine) missingFields.push("oneLine");
  if (!hasPhoto) missingFields.push("photo");

  if (missingFields.length > 0) {
    console.error("MISSING FIELDS:", missingFields.join(", "));
    redirect(`/provider/setup?error=missing-required&missing=${missingFields.join(",")}`);
  }

  const { data: existing } = await supabase
    .from("providers")
    .select("id, user_id, profile_photo_url, portfolio_photo_urls, video_url, category_slug, category_approved")
    .eq(isImpersonating ? "id" : "user_id", isImpersonating ? Number(impersonatingId) : data.user.id)
    .maybeSingle();

  const storageClient = isImpersonating ? createSupabaseServiceClient() : supabase;

  // Photos are uploaded client-side — just read the URLs
  let profilePhotoUrl = String(formData.get("existingProfilePhotoUrl") ?? "");
  let pendingProfilePhotoUrl: string | null = null;
  const uploadedProfilePhotoUrl = formData.get("uploadedProfilePhotoUrl") as string | null;

  if (uploadedProfilePhotoUrl) {
    if (isImpersonating) {
      profilePhotoUrl = uploadedProfilePhotoUrl;
    } else if (existing?.profile_photo_url) {
      pendingProfilePhotoUrl = uploadedProfilePhotoUrl;
    } else {
      profilePhotoUrl = uploadedProfilePhotoUrl;
    }
  }

  const existingPortfolioUrls: string[] = JSON.parse(
    String(formData.get("existingPortfolioUrls") ?? "[]")
  );
  const uploadedPortfolioUrls = formData.getAll("uploadedPortfolioUrls") as string[];
  const pendingPortfolioUrls = uploadedPortfolioUrls.length > 0 ? uploadedPortfolioUrls : null;

  // Category approval
  // Category approval
  const { data: existingCategories } = await supabase.from("categories").select("slug");
  const knownSlugs = (existingCategories ?? []).map((c: any) => c.slug);
  const isNewCategory = !knownSlugs.includes(categorySlug);

  const pendingCategorySlug = isNewCategory ? categorySlug : null;
  const finalCategorySlug = isNewCategory ? (existing?.category_slug ?? categorySlug) : categorySlug;

  // Video approval
  const pendingVideoUrl = videoUrl && videoUrl !== existing?.video_url ? videoUrl : null;
  const finalVideoUrl = existing?.video_url ?? null;

  // Slug
  const baseSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data: existingSlug } = await supabase
    .from("providers")
    .select("slug")
    .eq(isImpersonating ? "id" : "user_id", isImpersonating ? Number(impersonatingId) : data.user.id)
    .maybeSingle();
  const slug = existingSlug?.slug ?? `${baseSlug}-${data.user.id.slice(0, 8)}`;

  // ID document
  const idDocumentUrl = formData.get("uploadedIdUrl") as string | undefined ?? undefined;

  const payload = {
    slug,
    ...(idDocumentUrl && { id_document_url: idDocumentUrl }),
    full_name: fullName,
    business_name: businessName,
    category_slug: finalCategorySlug,
    pending_category_slug: isImpersonating ? null : pendingCategorySlug,
    profile_photo_url: profilePhotoUrl || existing?.profile_photo_url || null,
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
    redirect("/provider/dashboard?profile=saved");
  }

  const { error: upsertError } = await supabase.from("providers").upsert(
    { user_id: data.user.id, ...payload, ...(existing ? {} : { approved: false, subscription_status: "pending" }) },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    console.error("UPSERT FAILED:", JSON.stringify(upsertError));
    throw new Error("Upsert failed: " + upsertError.message);
  }

  if (!existing) {
    const refCode = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from("providers").update({ referral_code: refCode }).eq("user_id", data.user.id);
    sendWelcomeEmail({ providerEmail: email, providerName: fullName }).catch(e => console.error("Welcome email failed:", e));
    sendAdminNotificationEmail({
      subject: `New provider signed up — ${fullName}`,
      title: "New Provider Signup",
      body: `${fullName} (${email}) just created their provider profile as a ${categorySlug.replace(/-/g, " ")} in ${location}. Their account is pending your approval.`,
      actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/approvals`,
      actionLabel: "Review Provider →",
    }).catch(e => console.error("Admin notification failed:", e));
  } else {
    const pendingItems = [
      pendingProfilePhotoUrl && "profile photo",
      pendingPortfolioUrls && "portfolio photos",
      pendingVideoUrl && "intro video",
      pendingCategorySlug && `new category: ${pendingCategorySlug}`,
    ].filter(Boolean);
    if (pendingItems.length > 0) {
      sendAdminNotificationEmail({
        subject: `Provider update needs review — ${fullName}`,
        title: "Provider Update Pending Review",
        body: `${fullName} (${email}) submitted changes that need your approval: ${pendingItems.join(", ")}.`,
        actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/approvals`,
        actionLabel: "Review Now →",
      }).catch(e => console.error("Admin notification failed:", e));
    }
  }

  revalidatePath("/provider/setup");
  revalidatePath("/provider/dashboard");

  // Trigger profile score analysis in background
  // const { data: savedProvider } = await supabase
  //   .from("providers")
  //   .select("id")
  //   .eq("user_id", data.user.id)
  //   .maybeSingle();

  // if (savedProvider?.id) {
  //   fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/analyze-profile`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ providerId: savedProvider.id }),
  //   }).catch(() => { });
  // }

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

  if (provider?.email) {
    if (status === "approved") {
      await sendAccountApprovedEmail({ providerEmail: provider.email, providerName: provider.full_name });
    } else if (status === "suspended") {
      await sendAccountSuspendedEmail({ providerEmail: provider.email, providerName: provider.full_name });
    } else if (status === "rejected") {
      await sendAccountRejectedEmail({ providerEmail: provider.email, providerName: provider.full_name });
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
    .update({ status: "contacted", is_read: true })
    .eq("id", String(formData.get("requestId") ?? ""));

  revalidatePath("/provider/setup");
  revalidatePath("/provider/dashboard");
}

export async function updateUserName(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.auth.updateUser({ data: { full_name: String(formData.get("name") ?? "") } });
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      city: String(formData.get("city") ?? ""),
    },
    { onConflict: "id" }
  );

  redirect("/dashboard?settings=saved");
}

export async function requestAccountDelete() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const cookieStore = await cookies();
  const role = cookieStore.get("user-role")?.value;

  await sendEmailNotification({
    to: "info@profindly.com",
    subject: "Account Deletion Request",
    html: `<p>User requested account deletion:</p><p>Email: ${user.email}</p><p>User ID: ${user.id}</p><p>Role: ${role ?? "unknown"}</p>`,
  });

  await supabase.auth.signOut();

  redirect("/?deleted=requested");
}

export async function createStripeCheckout() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/auth/sign-in");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_customer_id, early_bird, subscription_status, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) redirect("/provider/setup");

  if (provider.stripe_subscription_id &&
    (provider.subscription_status === "active" || provider.subscription_status === "trialing")) {
    redirect("/provider/dashboard?already-subscribed=true");
  }

  const { count } = await supabase
    .from("providers")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  const isEarlyBird = (count ?? 0) < 100;
  const priceId = isEarlyBird
    ? process.env.STRIPE_EARLY_BIRD_PRICE_ID!
    : process.env.STRIPE_STANDARD_PRICE_ID!;

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
    .update({ admin_granted: false, subscription_status: "expired" })
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

export async function approvePendingMedia(formData: FormData) {
  "use server";
  const service = createSupabaseServiceClient();
  const providerId = Number(formData.get("providerId"));
  const field = String(formData.get("field"));

  const { data: provider } = await service
    .from("providers")
    .select("email, full_name, pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug")
    .eq("id", providerId)
    .maybeSingle();

  if (!provider) return;

  const updates: Record<string, unknown> = {};
  const approvedItems: string[] = [];

  if (field === "profile_photo" && provider.pending_profile_photo_url) {
    updates.profile_photo_url = provider.pending_profile_photo_url;
    updates.pending_profile_photo_url = null;
    approvedItems.push("Profile photo");
  }

  if (field === "portfolio" && provider.pending_portfolio_photo_urls) {
    updates.portfolio_photo_urls = provider.pending_portfolio_photo_urls;
    updates.pending_portfolio_photo_urls = null;
    approvedItems.push("Portfolio photos");
  }

  if (field === "video" && provider.pending_video_url) {
    updates.video_url = provider.pending_video_url;
    updates.pending_video_url = null;
    approvedItems.push("Intro video");
  }

  if (field === "category" && provider.pending_category_slug) {
    updates.category_slug = provider.pending_category_slug;
    updates.pending_category_slug = null;
    updates.category_approved = true;
    approvedItems.push(`Category: ${provider.pending_category_slug}`);

    const slug = provider.pending_category_slug;
    const name = slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const { data: existing } = await service.from("categories").select("id").eq("slug", slug).maybeSingle();
    if (!existing) {
      await service.from("categories").insert({ slug, name });
    }
  }

  await service.from("providers").update(updates).eq("id", providerId);

  if (provider.email && approvedItems.length > 0) {
    await sendMediaApprovedEmail({
      providerEmail: provider.email,
      providerName: provider.full_name,
      items: approvedItems,
    });
  }

  revalidatePath(`/admin/approvals/${providerId}`);
  redirect(`/admin/approvals/${providerId}`);
}