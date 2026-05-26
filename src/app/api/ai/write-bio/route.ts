import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createSupabaseServiceClient();
  const { data: provider } = await service
    .from("providers")
    .select("full_name, business_name, category_slug, location, language, one_line, bio")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) return NextResponse.json({ error: "No provider" }, { status: 404 });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Write a professional first-person bio for a service provider on ProFindly, a Canadian service marketplace.

Provider details:
- Name: ${provider.full_name}
${provider.business_name ? `- Business: ${provider.business_name}` : ""}
- Category: ${provider.category_slug.replace(/-/g, " ")}
- Location: ${provider.location}
- Languages: ${provider.language}
${provider.one_line ? `- One-liner: ${provider.one_line}` : ""}
${provider.bio ? `- Existing bio (use as context, rewrite it): ${provider.bio}` : ""}

Rules:
- 3-5 sentences, first person
- Professional but warm tone
- Do NOT mention specific prices
- Do NOT include contact info
- Highlight their location and languages naturally
- Return only the bio text, nothing else`,
        },
      ],
    }),
  });

  const data = await response.json();
  const bio = data.content?.[0]?.text?.trim() ?? "";

  if (!bio) return NextResponse.json({ error: "Failed to generate" }, { status: 500 });

  return NextResponse.json({ bio });
}