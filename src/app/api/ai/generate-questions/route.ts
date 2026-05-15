import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { category } = await req.json();

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
          content: `You are helping build an AI training profile for a service provider in the "${category}" category on a Canadian service marketplace.

Generate exactly 12 specific, practical questions that will help an AI assistant better match this provider with the right clients. Questions should be about their services, specializations, pricing range, typical clients, languages, availability, and unique strengths.

Return ONLY a valid JSON array of strings. No explanation, no markdown, no preamble.
Example: ["Question 1?", "Question 2?"]`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "[]";

  try {
    const questions = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: [] });
  }
}