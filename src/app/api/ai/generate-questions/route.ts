import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { category, providerId } = await req.json();

  const service = createSupabaseServiceClient();

  // Return existing questions if already generated
  const { data: existing } = await service
    .from("provider_qa")
    .select("id, question, answer, answered_at, ai_approved, ai_rejection_reason")
    .eq("provider_id", Number(providerId))
    .order("created_at", { ascending: true });

  if (existing && existing.length > 0) {
    return NextResponse.json({ questions: existing.map(q => q.question), existing });
  }

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
      messages: [
        {
          role: "user",
          content: `You are generating AI training questions for a "${category}" provider on ProFindly, a Canadian service marketplace.

These questions train a search AI to match clients with the right provider. Think about every possible way a client might search for this type of provider.

Generate exactly 8 questions covering:
- Specific specializations within ${category}
- Types of clients or cases they handle best
- Their approach or process (what makes them different)
- Pricing style (hourly, flat fee, packages, free consultation)
- Availability (in-person, online, both, weekends)
- Certifications, credentials, or years of experience
- Specific situations or problems they solve best
- Any niche expertise within ${category}

RULES:
- Do NOT ask about location, language, or category name — already in profile
- Questions must be specific to ${category}, not generic
- Keep questions short and conversational

Return ONLY a valid JSON array of exactly 8 strings. No explanation, no markdown.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "[]";

  try {
    const questions = JSON.parse(text.replace(/```json|```/g, "").trim());

    const rows = questions.map((q: string) => ({
      provider_id: Number(providerId),
      question: q,
      answer: null,
      ai_approved: false,
      answered_at: null,
    }));

    const { error: insertError } = await service.from("provider_qa").insert(rows);
    console.log("insert error:", insertError);

    return NextResponse.json({ questions, existing: [] });
  } catch {
    return NextResponse.json({ questions: [], existing: [] });
  }
}