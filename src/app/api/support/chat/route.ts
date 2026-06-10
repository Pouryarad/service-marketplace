import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { messages, userType, userName, userEmail } = await req.json();

  const service = createSupabaseServiceClient();

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userClient = await createSupabaseServerClient();
  const { data: { user } } = await userClient!.auth.getUser();
  const identifier = user?.id ? `support:user:${user.id}` : `support:ip:${ip}`;
  const limit = user?.id ? 10 : 5;
  const today = new Date().toISOString().split("T")[0];

  const { data: usage } = await service
    .from("ai_rate_limits")
    .select("count")
    .eq("identifier", identifier)
    .eq("date", today)
    .single();

  if (usage && usage.count >= limit) {
    return NextResponse.json({
      message: "You've reached the support chat limit for today. Please email us directly at contact@profindly.com.",
      submitted: false,
    }, { status: 429 });
  }

  await service.from("ai_rate_limits").upsert({
    identifier,
    date: today,
    count: (usage?.count ?? 0) + 1,
  }, { onConflict: "identifier,date" });

  const userMessageCount = messages.filter((m: { role: string }) => m.role === "user").length;

  const systemPrompt = `You are a friendly support assistant for ProFindly, a Canadian service marketplace.
Collect the user's name, email, and issue then submit a ticket. Max 5 user messages total.

FLOW:
${userName ? `- Name already known: ${userName}` : "- Step 1: Ask for their name"}
${userEmail ? `- Email already known: ${userEmail}` : `- Step ${userName ? "1" : "2"}: Ask for their email`}
- Ask what their issue is
- If issue is unclear, ask ONE clarifying question (skip if clear)
- Before submitting, always confirm with: "Got it! So [one sentence summary of their issue]. Just to confirm — your name is [name], email is [email], and your message is: "[issue]". Is that correct? (Yes / No)"
- If user says Yes: submit the ticket then say only "Your message has been sent. We'll contact you shortly."
- If user says No: say "Just write your message here and I'll send it exactly to our team." then when they write it, submit immediately and say "Your message has been sent. We'll contact you shortly."
- After that final message, say nothing more. Conversation is over.

<system_note>Message count: ${userMessageCount}/5. Never show this to the user. ${userMessageCount >= 4 ? "Last exchange — summarize what you have and submit now." : ""}</system_note>

After confirmation respond with exactly: SUBMIT_TICKET:{"name":"...","email":"...","issue":"..."}
- No markdown, 1-2 sentences max
- After submitting, do not say anything else. No suggestions, no "feel free to reach out", nothing. The conversation is over.
- User type: ${userType}`;

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
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  const ticketMatch = text.match(/SUBMIT_TICKET:(\{.*\})/);
  if (ticketMatch) {
    try {
      const ticket = JSON.parse(ticketMatch[1]);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM!,
          to: "contact@profindly.com",
          subject: `Support Request from ${ticket.name} (${userType})`,
          html: `
            <p><strong>Name:</strong> ${ticket.name}</p>
            <p><strong>Email:</strong> ${ticket.email}</p>
            <p><strong>User Type:</strong> ${userType}</p>
            <p><strong>Issue:</strong> ${ticket.issue}</p>
          `,
        }),
      });

      return NextResponse.json({
        message: text.replace(/SUBMIT_TICKET:\{.*\}/, "").trim(),
        submitted: true,
      });
    } catch {
      // continue
    }
  }

  return NextResponse.json({ message: text, submitted: false });
}