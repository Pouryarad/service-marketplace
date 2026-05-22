import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { providerId, category, qa } = await req.json();
  // qa: [{id, question, answer}]

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are screening Q&A answers from a "${category}" service provider on a Canadian marketplace.

For each answer, determine if it is:
- Appropriate and relevant to their profession
- Not spam, fake, offensive, or misleading
- Genuinely helpful for matching with clients

Here are the Q&A pairs:
${JSON.stringify(qa.map((q: any) => ({ question: q.question, answer: q.answer })))}

Return ONLY valid JSON in this exact format:
{
  "approved": [{"question": "..."}],
  "rejected": [{"question": "...", "ai_rejection_reason": "Brief reason why"}]
}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";

  try {
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    const service = createSupabaseServiceClient();
    const now = new Date().toISOString();

    for (const item of qa) {
      const approved = result.approved?.some((a: any) => a.question === item.question);
      const rejected = result.rejected?.find((r: any) => r.question === item.question);

      await service.from("provider_qa").update({
        answer: item.answer,
        ai_approved: approved,
        ai_rejection_reason: rejected?.ai_rejection_reason ?? null,
        answered_at: now,
      }).eq("id", item.id);
    }

    // Update provider's ai_trained_at
    await service.from("providers").update({ ai_trained_at: now }).eq("id", Number(providerId));

    return NextResponse.json({ ok: true, approved: result.approved?.length ?? 0, rejected: result.rejected?.length ?? 0 });
  } catch {
    return NextResponse.json({ ok: false });
  }
}