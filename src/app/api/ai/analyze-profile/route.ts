import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { providerId } = await req.json();
  if (!providerId) return NextResponse.json({ error: "No providerId" }, { status: 400 });

  const service = createSupabaseServiceClient();

  const { data: provider } = await service
    .from("providers")
    .select("full_name, category_slug, bio, one_line, profile_photo_url, video_url, portfolio_photo_urls")
    .eq("id", Number(providerId))
    .maybeSingle();

  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: qaData } = await service
    .from("provider_qa")
    .select("question, answer, ai_approved")
    .eq("provider_id", Number(providerId));

  const totalQuestions = qaData?.length ?? 0;
  const approvedAnswers = qaData?.filter((q) => q.ai_approved && q.answer?.trim()).length ?? 0;

  // Calculate fixed scores
  const photoScore = provider.profile_photo_url ? 5 : 0;
  const oneLineScore = provider.one_line?.trim() ? 5 : 0;
  const portfolioScore = (provider.portfolio_photo_urls?.length ?? 0) > 0 ? 15 : 0;
  const youtubeScore = provider.video_url?.trim() ? 15 : 0;
  const aiScore = totalQuestions > 0 ? Math.round((approvedAnswers / totalQuestions) * 40) : 0;

  const feedback: { field: string; message: string }[] = [];

  if (!provider.profile_photo_url) {
    feedback.push({ field: "Profile Photo", message: "Add a profile photo to build trust with clients." });
  }
  if (!provider.one_line?.trim()) {
    feedback.push({ field: "One-liner", message: "Add a one-liner so clients instantly know what you do." });
  }
  if (portfolioScore === 0) {
    feedback.push({ field: "Portfolio", message: "Upload at least one portfolio photo to showcase your work." });
  }
  if (youtubeScore === 0) {
    feedback.push({ field: "Intro Video", message: "Add a YouTube intro video — providers with videos get more contacts." });
  }
  if (totalQuestions === 0) {
    feedback.push({ field: "AI Training", message: "Complete your AI training so the search can match you to clients." });
  } else if (approvedAnswers < totalQuestions) {
    const missing = totalQuestions - approvedAnswers;
    feedback.push({ field: "AI Training", message: `${missing} of your AI training answer${missing > 1 ? "s were" : " was"} not approved. Improve them to boost your score.` });
  }

  // Bio analysis via Claude
  let bioScore = 0;
  if (!provider.bio?.trim()) {
    feedback.push({ field: "Bio", message: "Write a bio to help clients understand your background and expertise." });
  } else {
    const category = provider.category_slug.replace(/-/g, " ");
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
          content: `You are scoring a "${category}" provider's bio on a Canadian service marketplace.

Bio: "${provider.bio}"

Score it from 0 to 20. Be generous — a professional, readable bio that mentions their work deserves 16-20. Only score below 10 if the bio is completely irrelevant, empty-sounding, or pure gibberish.

Scoring guide:
- 18-20: Professional, relevant, specific, good length (100-580 chars)
- 14-17: Good but could be more specific or slightly too short/long
- 10-13: Somewhat relevant but generic or very short
- 0-9: Irrelevant, gibberish, or placeholder text

Only provide a tip if score is under 16. Tip must be under 15 words and actionable. If score is 16+, tip is null.

Return only valid JSON: {"score": number, "tip": string | null}`,
        }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "{}";
    try {
      const result = JSON.parse(text.replace(/```json|```/g, "").trim());
      bioScore = Math.min(result.score ?? 0, 20);
      if (result.tip) {
        feedback.push({ field: "Bio", message: result.tip });
      }
    } catch {
      bioScore = 10;
    }
  }

  const totalScore = photoScore + oneLineScore + bioScore + portfolioScore + youtubeScore + aiScore;

  await service
    .from("providers")
    .update({ profile_score: totalScore, profile_feedback: feedback })
    .eq("id", Number(providerId));

  return NextResponse.json({ score: totalScore, feedback });
}