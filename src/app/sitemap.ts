import { createSupabaseServiceClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://profindly.com";

export default async function sitemap() {
  const service = createSupabaseServiceClient();

  const { data: providers } = await service
    .from("providers")
    .select("slug, id")
    .eq("approved", true)
    .eq("suspended", false)
    .eq("subscription_status", "active");

  const { data: categories } = await service
    .from("categories")
    .select("slug");

  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/refunds`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryPages = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const providerPages = (providers ?? []).map((p) => ({
    url: `${SITE_URL}/providers/${p.slug ?? p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...providerPages];
}