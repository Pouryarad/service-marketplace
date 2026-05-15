import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, userType, userName, userEmail } = await req.json();

  const systemPrompt = `You are a friendly support assistant for ProFindly, a Canadian service marketplace.
Your job is to collect the user's issue and contact info through a natural conversation.

RULES:
- Be warm, concise, and helpful
${userName ? `- User's name is already known: ${userName}` : "- Ask for their name first if you don't have it"}
${userEmail ? `- User's email is already known: ${userEmail}` : "- Ask for their email if you don't have it"}
- Ask what their issue or question is
- Once you have all info — summarize and confirm with them
- After confirmation, respond with exactly: SUBMIT_TICKET:{"name":"...","email":"...","issue":"..."}
- Never use markdown formatting
- Keep responses short, max 2-3 sentences
- User type is: ${userType}`;

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

  // Check if AI wants to submit ticket
  const ticketMatch = text.match(/SUBMIT_TICKET:(\{.*\})/);
  if (ticketMatch) {
    try {
      const ticket = JSON.parse(ticketMatch[1]);

      // Send email via Resend
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