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
  profile_photo_url: string;
  approved: boolean;
  suspended: boolean;
  subscription_status: string | null;
};

function mapProvider(row: ProviderRow): Provider {
  return {
    id: String(row.id),
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
    oneLine: row.bio?.slice(0, 80) || "",
    profilePhotoUrl: row.profile_photo_url,
    portfolioPhotoUrls: [],
    approved: row.approved,
    suspended: row.suspended,
    status: "active",
    subscriptionStatus: (row.subscription_status as Provider["subscriptionStatus"]) ?? "active",
    featuredRank: null,
    clicksDay: 0,
    clicksWeek: 0,
    clicksMonth: 0,
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
    query = query.order("name", { ascending: true });
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

export async function getProvider(id: string) {
  const providers = await getProviders({ includeHidden: true });
  return providers.find((provider) => String(provider.id) === String(id)) ?? null;
}

export async function getContactRequests() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("DASHBOARD USER:", user?.id);

  if (!user) return [];

  const { data, error } = await supabase
    .from("contact_requests")
    .select(`
  id,
  provider_id,
  created_at,
  message,
  status,
  client_name,
  client_email,
  phone
`)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("REQUEST ERROR:", error);
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
  clientName: req.client_name,
  clientEmail: req.client_email,
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
