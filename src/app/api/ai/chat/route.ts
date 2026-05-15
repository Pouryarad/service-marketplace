import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const service = createSupabaseServiceClient();

  // Fetch all active providers with their QA
  const { data: providers } = await service
    .from("providers")
    .select("id, full_name, category_slug, location, language, bio, one_line, slug, profile_photo_url")
    .eq("approved", true)
    .eq("suspended", false)
    .eq("subscription_status", "active");

  const { data: qaData } = await service
    .from("provider_qa")
    .select("provider_id, question, answer")
    .eq("ai_approved", true);

  // Build provider context
  const providerContext = (providers ?? []).map((p) => {
    const qa = (qaData ?? [])
      .filter((q) => q.provider_id === p.id)
      .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
      .join("\n");

    return `---
Provider ID: ${p.id}
Name: ${p.full_name}
Slug: ${p.slug ?? p.id}
Category: ${p.category_slug}
Location: ${p.location}
Language: ${p.language}
Bio: ${p.bio ?? ""}
One-liner: ${p.one_line ?? ""}
${qa ? `Additional Info:\n${qa}` : ""}`;
  }).join("\n\n");

  const systemPrompt = `You are a friendly AI assistant for ProFindly, a Canadian service marketplace. Your job is to help clients find the right professional through a natural conversation.

RULES:
- Always ask about preferred language early in the conversation
- Ask focused follow-up questions to understand the client's needs (max 5 questions total across the conversation)
- If the client mentions a preferred language, switch to that language for all subsequent responses
- Keep responses short and conversational
- When you have enough info (usually after 2-3 messages), suggest matching providers
- When suggesting providers, return a JSON block at the END of your message in this exact format:
PROVIDERS_JSON:[{"id":"ID","slug":"SLUG","fullName":"FULL_NAME","categoryName":"CATEGORY","location":"LOCATION","profilePhotoUrl":"PROFILE_PHOTO_URL","oneLine":"ONE_LINE","matchReason":"ONE SENTENCE WHY THEY MATCH"}]
- Always include the exact profilePhotoUrl value from the provider data above
- matchReason should be 1 short sentence explaining why they match
- Only suggest providers that genuinely match the client's needs
- If no providers match, say so and suggest browsing categories
- Be warm, helpful, and concise
- Never use markdown formatting like **bold** or *italic* in your responses

AVAILABLE PROVIDERS:
${providerContext}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

// Parse providers from response
  let message = text;
  let matchedProviders: any[] = [];

  const jsonMatch = text.match(/PROVIDERS_JSON:(\[[\s\S]*?\])/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      // Inject real data from DB to avoid AI hallucinating photo URLs
      matchedProviders = parsed.map((p: any) => {
        const real = (providers ?? []).find(
          (r) => String(r.id) === String(p.id) || r.slug === p.slug
        );
        return {
          ...p,
          profilePhotoUrl: real?.profile_photo_url ?? "",
          slug: real?.slug ?? p.slug ?? p.id,
        };
      });
      message = text.replace(/PROVIDERS_JSON:[\s\S]*$/, "").trim();
    } catch {
      matchedProviders = [];
    }
  }

  return NextResponse.json({ message, providers: matchedProviders });
}