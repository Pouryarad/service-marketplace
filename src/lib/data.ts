import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "./supabase/server";
import type { Category, ContactRequest, Provider } from "./types";

type ProviderRow = {
  id: string;
  full_name: string;
  business_name: string | null;
  category_id: string;
  location: string;
  language: string;
  email: string;
  phone: string;
  bio: string;
  one_line: string;
  profile_photo_url: string;
  portfolio_photo_urls: string[] | null;
  approved: boolean;
  suspended: boolean;
  status: Provider["status"];
  subscription_status: Provider["subscriptionStatus"];
  featured_rank: number | null;
  clicks_day: number | null;
  clicks_week: number | null;
  clicks_month: number | null;
  categories: { slug: string; name: string } | null;
};

function mapProvider(row: ProviderRow): Provider {
  return {
    id: row.id,
    fullName: row.full_name,
    businessName: row.business_name,
    categoryId: row.category_id,
    categorySlug: row.categories?.slug ?? row.category_id,
    categoryName: row.categories?.name ?? "Service",
    location: row.location,
    language: row.language,
    email: row.email,
    phone: row.phone,
    bio: row.bio,
    oneLine: row.one_line,
    profilePhotoUrl: row.profile_photo_url,
    portfolioPhotoUrls: row.portfolio_photo_urls ?? [],
    approved: row.approved,
    suspended: row.suspended,
    status: row.status,
    subscriptionStatus: row.subscription_status,
    featuredRank: row.featured_rank,
    clicksDay: row.clicks_day ?? 0,
    clicksWeek: row.clicks_week ?? 0,
    clicksMonth: row.clicks_month ?? 0,
  };
}

export async function getCurrentUser() {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCategories(): Promise<Category[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, image_url")
    .order("name");
    console.log("DATA:", data);
console.log("ERROR:", error);

  if (error) {
  console.log(error);
  return [];
}

  return data.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    imageUrl: category.image_url,
  }));
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
    .from("provider_profiles")
    .select("*, categories(slug, name)");

  if (!options?.includeHidden) {
    query = query
      .eq("approved", true)
      .eq("suspended", false)
      .eq("subscription_status", "active");
  }

  const { data, error } = await query.order("featured_rank", {
    ascending: true,
    nullsFirst: false,
  });

  if (error) return [];

  return filterProviders((data as ProviderRow[]).map(mapProvider), options);
}

export async function getProvider(id: string) {
  const providers = await getProviders({ includeHidden: true });
  return providers.find((provider) => provider.id === id) ?? null;
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  noStore();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("contact_requests")
    .select("id, provider_id, provider_name, client_name, client_email, phone, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data.map((request) => ({
    id: request.id,
    providerId: request.provider_id,
    providerName: request.provider_name,
    clientName: request.client_name,
    clientEmail: request.client_email,
    phone: request.phone,
    message: request.message,
    status: request.status,
    createdAt: request.created_at,
  }));
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
