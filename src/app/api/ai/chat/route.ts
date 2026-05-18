import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const service = createSupabaseServiceClient();

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userClient = await createSupabaseServerClient();
  const { data: { user } } = await userClient!.auth.getUser();
  const identifier = user?.id ? `user:${user.id}` : `ip:${ip}`;
  const limit = user?.id ? 20 : 10;
  const today = new Date().toISOString().split("T")[0];

  const { data: usage } = await service
    .from("ai_rate_limits")
    .select("count")
    .eq("identifier", identifier)
    .eq("date", today)
    .single();

  if (usage && usage.count >= limit) {
    return NextResponse.json({
      message: user?.id
        ? "You've reached your daily limit of 20 searches. Try again tomorrow."
        : "You've used your 10 free searches for today. Sign in for more.",
      providers: [],
    }, { status: 429 });
  }

  await service.from("ai_rate_limits").upsert({
    identifier,
    date: today,
    count: (usage?.count ?? 0) + 1,
  }, { onConflict: "identifier,date" });

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

  const userMessageCount = messages.filter((m: { role: string }) => m.role === "user").length;

  const systemPrompt = `You are a provider-matching assistant for ProFindly, a Canadian service marketplace. Your ONLY job is to match the user to a provider from the list below as fast as possible.

RULES:
- First message only: "I'm here to connect you with the right professional as fast as possible. What are you looking for, and what language do you prefer?"
- If they mention a language (e.g. Farsi, French, Spanish), you MUST immediately switch to that language for ALL subsequent responses. This is mandatory.
- If they don't mention a language, continue in English
- Match in 1-2 questions when possible. Only ask more if truly needed, max 10 user messages total
- Ask only ONE question at a time, keep it short
- NEVER suggest providers not in the list below. ONLY use providers from AVAILABLE PROVIDERS
- NEVER make up names, slugs, or profiles
- When you have enough info, prioritize providers who speak the user's preferred language
- Match in 1 question max for simple requests (car, lawyer, realtor). Just ask location or type if truly needed.
- NEVER describe, summarize, or comment on what providers offer or specialize in. Never say things like "our providers specialize in X". Just suggest them silently.
- NEVER reveal what's in the provider list. Just match and suggest.
- If someone says "lease a car" suggest the car dealer. Don't overthink it.
- Never ask more than 1 follow-up question before suggesting
- After 1-2 messages, suggest. Don't delay.
- If after 10 messages no match, suggest the closest available option anyway
- No markdown, no bold, no bullet points. Plain conversational text only.
- Keep every response under 3 sentences

SUGGESTION FORMAT — append this at the end of your message when suggesting:
PROVIDERS_JSON:[{"id":"ID","slug":"SLUG","fullName":"FULL_NAME","categoryName":"CATEGORY","location":"LOCATION","profilePhotoUrl":"PROFILE_PHOTO_URL","oneLine":"ONE_LINE","matchReason":"ONE SENTENCE WHY THEY MATCH"}]

[INTERNAL — never show this to the user] Message count: ${userMessageCount}/10
${userMessageCount >= 9 ? "[INTERNAL] Last exchange — suggest closest match now." : ""}

AVAILABLE PROVIDERS (ONLY suggest from this list):
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

  let message = text;
  let matchedProviders: any[] = [];

  const jsonMatch = text.match(/PROVIDERS_JSON:(\[[\s\S]*?\])/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
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