import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { providerId, category, qa } = await req.json();

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
${JSON.stringify(qa)}

Return ONLY valid JSON in this exact format:
{
  "approved": [{"question": "...", "answer": "..."}],
  "rejected": [{"question": "...", "answer": "...", "ai_rejection_reason": "Brief reason why"}]
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

    // Save approved answers
    if (result.approved?.length > 0) {
      await service.from("provider_qa").delete().eq("provider_id", Number(providerId)).eq("ai_approved", true);
      await service.from("provider_qa").insert(
        result.approved.map((qa: { question: string; answer: string }) => ({
          provider_id: Number(providerId),
          question: qa.question,
          answer: qa.answer,
          ai_approved: true,
        }))
      );
    }

    // Save rejected answers
    if (result.rejected?.length > 0) {
      await service.from("provider_qa").insert(
        result.rejected.map((qa: { question: string; answer: string; ai_rejection_reason: string }) => ({
          provider_id: Number(providerId),
          question: qa.question,
          answer: qa.answer,
          ai_approved: false,
          ai_rejection_reason: qa.ai_rejection_reason,
        }))
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ approved: [], rejected: [] });
  }
}