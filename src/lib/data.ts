import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "./supabase/server";
import type { Category, ContactRequest, Provider } from "./types";

type ProviderRow = {
  id: number;
  full_name: string;
  business_name: string | null;
  category_slug: string;
  location: string;
  language: string;
  email: string;
  phone: string;
  bio: string;
  one_line: string | null;
  profile_photo_url: string;
  approved: boolean;
  suspended: boolean;
  status: string | null;
  subscription_status: string | null;
  clicks_day: number | null;
  clicks_week: number | null;
  clicks_month: number | null;
  video_url: string | null;
  portfolio_photo_urls: string[] | null;
  slug: string | null;
  admin_granted: boolean | null;
};

function mapProvider(row: ProviderRow): Provider {
  return {
    id: String(row.id),
    slug: row.slug ?? String(row.id),
    userId: (row as any).user_id ?? undefined,
    fullName: row.full_name,
    businessName: row.business_name,
    categoryId: row.category_slug,
    categorySlug: row.category_slug,
    categoryName: row.category_slug
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    location: row.location,
    language: row.language,
    email: row.email,
    phone: row.phone,
    bio: row.bio,
    oneLine: row.one_line || "",
    profilePhotoUrl: row.profile_photo_url || (row as any).pending_profile_photo_url || "",
    approved: row.approved,
    suspended: row.suspended,
    status: row.suspended ? "suspended" : row.approved ? "approved" : "pending",
    subscriptionStatus: (row.subscription_status as Provider["subscriptionStatus"]) ?? "pending",
    featuredRank: null,
    clicksDay: row.clicks_day ?? 0,
    clicksWeek: row.clicks_week ?? 0,
    clicksMonth: row.clicks_month ?? 0,
    videoUrl: row.video_url ?? null,
    portfolioPhotoUrls: row.portfolio_photo_urls ?? [],
    pendingProfilePhotoUrl: (row as any).pending_profile_photo_url ?? null,
    adminGranted: (row as any).admin_granted ?? false,
    adminGrantedExpiresAt: (row as any).admin_granted_expires_at ?? null,
  };
}

export async function getCurrentUser() {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCategories(limit?: number): Promise<Category[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, image_url")
    .order("name");

  if (error || !data) return [];

  // Only show categories that have at least one active provider
  const { data: activeProviders } = await supabase
    .from("providers")
    .select("category_slug")
    .eq("approved", true)
    .eq("suspended", false)
    .eq("subscription_status", "active");

  const activeSlugs = new Set((activeProviders ?? []).map((p) => p.category_slug));

  const filtered = data
    .filter((c) => activeSlugs.has(c.slug))
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, imageUrl: c.image_url }));

  return limit ? filtered.slice(0, limit) : filtered;
}

export async function getLanguages(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("providers")
    .select("language");

  if (!data) return [];

  const all = data
    .flatMap((p) => p.language.split(","))
    .map((l) => l.trim());

  return Array.from(new Set(all));
}

export async function getCategory(slug: string) {
  const all = await getCategories();
  return all.find((category) => category.slug === slug) ?? null;
}

export async function getProviders(options?: {
  categorySlug?: string;
  language?: string;
  location?: string;
  sort?: string;
  includeHidden?: boolean;
}): Promise<Provider[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }


  let query = supabase
    .from("providers")
    .select("*");

  if (options?.categorySlug) {
    query = query.eq("category_slug", options.categorySlug);
  }

  if (options?.language) {
    query = query.ilike("language", `%${options.language}%`);
  }

  if (options?.location) {
    query = query.ilike("location", `%${options.location}%`);
  }

  if (options?.sort === "az") {
    query = query.order("full_name", { ascending: true });
  } else {
    query = query.order("id", { ascending: false });
  }

  if (!options?.includeHidden) {
    query = query
      .eq("approved", true)
      .eq("suspended", false)
      .eq("subscription_status", "active");
  }

  const { data, error } = await query;

  if (error) return [];

  return (data || []).map(mapProvider);
}

export async function getProvider(slugOrId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const isNumeric = /^\d+$/.test(slugOrId);

  const query = supabase.from("providers").select("*");
  const { data, error } = await (isNumeric
    ? query.eq("id", Number(slugOrId))
    : query.eq("slug", slugOrId)
  ).maybeSingle();

  if (error || !data) return null;
  return mapProvider(data);
}

export async function getCurrentProviderProfile() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return mapProvider(data);
}

export async function getProviderRequests() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: providerRow } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!providerRow) return [];

  const { data, error } = await supabase
    .from("contact_requests")
    .select("id, created_at, message, status, name, email, phone")
    .eq("provider_id", providerRow.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((req) => ({
    id: req.id,
    clientName: req.name ?? "Unknown",
    clientEmail: req.email ?? "",
    phone: req.phone ?? null,
    message: req.message ?? "",
    status: (req.status ?? "new") as "new" | "contacted",
    created_at: req.created_at,
  }));
}

export async function getContactRequests(audience?: "client" | "provider") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  if (audience === "provider") {
    // Get the provider row that belongs to this user
    const { data: providerRow } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!providerRow) return [];

    const { data, error } = await supabase
      .from("contact_requests")
      .select("id, created_at, message, status, name, email, phone, client_id")
      .eq("provider_id", providerRow.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PROVIDER REQUEST ERROR:", error);
      return [];
    }

    return (data || []).map((req) => ({
      id: req.id,
      created_at: req.created_at,
      message: req.message,
      status: req.status,
      clientName: req.name,
      clientEmail: req.email,
      phone: req.phone,
      provider: null,
    }));
  }

  // Client: show requests they sent
  const { data, error } = await supabase
    .from("contact_requests")
    .select("id, provider_id, created_at, message, status, name, email, phone")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("CLIENT REQUEST ERROR:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const providerIds = data.map((r) => r.provider_id);
  const { data: providers } = await supabase
    .from("providers")
    .select("*")
    .in("id", providerIds);

  return data.map((req) => {
    const provider = providers?.find(
      (p) => String(p.id) === String(req.provider_id)
    );
    return {
      id: req.id,
      created_at: req.created_at,
      message: req.message,
      status: req.status,
      clientName: req.name,
      clientEmail: req.email,
      phone: req.phone,
      provider,
    };
  });
}

function filterProviders(providers: Provider[], options?: {
  categorySlug?: string;
  language?: string;
  location?: string;
  sort?: string;
  includeHidden?: boolean;
}) {
  let result = providers;
  if (!options?.includeHidden) {
    result = result.filter(
      (provider) =>
        provider.approved &&
        !provider.suspended &&
        provider.subscriptionStatus === "active",
    );
  }

  if (options?.categorySlug) {
    result = result.filter((provider) => provider.categorySlug === options.categorySlug);
  }

  if (options?.language) {
    result = result.filter((provider) =>
      provider.language.toLowerCase().includes(options.language!.toLowerCase()),
    );
  }

  if (options?.location) {
    result = result.filter((provider) =>
      provider.location.toLowerCase().includes(options.location!.toLowerCase()),
    );
  }

  if (options?.sort === "closest") {
    result = [...result].sort((a, b) => a.location.localeCompare(b.location));
  } else {
    result = [...result].sort((a, b) => {
      const featuredA = a.featuredRank ?? 99;
      const featuredB = b.featuredRank ?? 99;
      return featuredA - featuredB || b.clicksWeek - a.clicksWeek;
    });
  }

  return result;

}
export async function getCurrentUserRole() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role ?? "client";
}

export async function getProviderInsights(providerId: number) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("provider_insights")
    .select("*")
    .eq("provider_id", providerId);

  if (error || !data) return null;

  const get = (eventType: string) =>
    data.find((r) => r.event_type === eventType) ?? {
      count_day: 0,
      count_week: 0,
      count_month: 0,
      count_total: 0,
    };

  return {
    profileViews: get("view_profile"),
    emailReveals: get("reveal_email"),
    phoneReveals: get("reveal_phone"),
    contactRequests: get("contact_request_sent"),
  };
}