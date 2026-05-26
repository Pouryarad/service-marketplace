import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = await req.json().catch(() => ({ answers: null }));

  const service = createSupabaseServiceClient();
  const { data: provider } = await service
    .from("providers")
    .select("full_name, business_name, category_slug, location, language, one_line")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) return NextResponse.json({ error: "No provider" }, { status: 404 });

  const category = provider.category_slug.replace(/-/g, " ");

  if (!answers) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{
          role: "user",
          content: `Generate exactly 2 short questions to help write a bio for a "${category}" provider in Canada. Questions should uncover what makes them unique and who they help best. Do NOT ask about location or language. Return only a JSON array of 2 strings. No explanation.`,
        }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text ?? "[]";
    try {
      const questions = JSON.parse(text.replace(/```json|```/g, "").trim());
      return NextResponse.json({ questions });
    } catch {
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `Write a professional first-person bio for a "${category}" provider on ProFindly, a Canadian service marketplace.

Provider info:
- Name: ${provider.full_name}
${provider.business_name ? `- Business: ${provider.business_name}` : ""}
- Location: ${provider.location}
- Languages: ${provider.language}
${provider.one_line ? `- One-liner: ${provider.one_line}` : ""}

Their answers:
${answers.map((a: { question: string; answer: string }) => `Q: ${a.question}\nA: ${a.answer}`).join("\n")}

Rules:
- First person, 3-5 sentences
- Professional but warm
- No contact info, no prices
- MUST be under 600 characters
- Return only the bio text`,
      }],
    }),
  });

  const data = await res.json();
  const bio = data.content?.[0]?.text?.trim() ?? "";
  if (!bio) return NextResponse.json({ error: "Failed to generate" }, { status: 500 });

  return NextResponse.json({ bio });
}