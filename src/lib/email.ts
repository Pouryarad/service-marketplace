const SITE_NAME = "ProFindly";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://service-marketplace-ivory.vercel.app";

async function send({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.info("[email] queued (no SMTP configured)", { to, subject });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[email] send failed", { to, subject, status: res.status, text });
  }
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f3f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#1a1a2e;padding:24px 32px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">${SITE_NAME}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                You're receiving this because you have an account on ${SITE_NAME}.<br/>Questions? Reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:24px;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">${label}</a>`;
}
function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1f1f1f;">${text}</h1>`;
}
function p(text: string) {
  return `<p style="margin:12px 0;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`;
}
function badge(text: string, color: "green" | "red" | "yellow" | "blue") {
  const map = {
    green: "background:#d1fae5;color:#065f46;",
    red: "background:#fee2e2;color:#991b1b;",
    yellow: "background:#fef3c7;color:#92400e;",
    blue: "background:#dbeafe;color:#1e40af;",
  };
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;${map[color]}">${text}</span>`;
}

// ─── Exported send functions ──────────────────────────────────────────────────

export async function sendNewContactRequestEmail({
  providerEmail,
  providerName,
  clientName,
  clientEmail,
  clientPhone,
  message,
}: {
  providerEmail: string;
  providerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  message: string;
}) {
  await send({
    to: providerEmail,
    subject: `New contact request from ${clientName}`,
    html: layout(`
      ${h1("You have a new contact request")}
      ${p(`<strong>${clientName}</strong> reached out to you on ${SITE_NAME}.`)}
      <table style="width:100%;background:#f9fafb;border-radius:10px;padding:16px;margin:16px 0;border-collapse:collapse;">
        <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:100px;">From</td><td style="padding:6px 0;font-size:14px;color:#1f1f1f;font-weight:600;">${clientName}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td><td style="padding:6px 0;font-size:14px;color:#1f1f1f;">${clientEmail}</td></tr>
        ${clientPhone ? `<tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Phone</td><td style="padding:6px 0;font-size:14px;color:#1f1f1f;">${clientPhone}</td></tr>` : ""}
        <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;vertical-align:top;">Message</td><td style="padding:6px 0;font-size:14px;color:#1f1f1f;">${message}</td></tr>
      </table>
      ${btn("View in Dashboard", `${SITE_URL}/provider/requests`)}
    `),
  });
}

export async function sendAccountApprovedEmail({
  providerEmail,
  providerName,
}: {
  providerEmail: string;
  providerName: string;
}) {
  await send({
    to: providerEmail,
    subject: "Your ProFindly account has been approved 🎉",
    html: layout(`
      ${h1("You're approved!")}
      ${p(`Hi ${providerName}, your ${SITE_NAME} provider account has been reviewed and approved.`)}
      ${p("To complete your setup and go live, head to your dashboard and activate your subscription under the Payment tab.")}
${badge("Account Approved", "green")}
${btn("Activate Subscription →", `${SITE_URL}/provider/setup?tab=payment`)}
    `),
  });
}

export async function sendAccountRejectedEmail({
  providerEmail,
  providerName,
}: {
  providerEmail: string;
  providerName: string;
}) {
  await send({
    to: providerEmail,
    subject: "Update on your ProFindly application",
    html: layout(`
      ${h1("Application not approved")}
      ${p(`Hi ${providerName}, after reviewing your profile we're unable to approve your account at this time.`)}
      ${p("If you believe this is a mistake or would like more information, please reply to this email.")}
      ${badge("Not Approved", "red")}
    `),
  });
}

export async function sendAccountSuspendedEmail({
  providerEmail,
  providerName,
}: {
  providerEmail: string;
  providerName: string;
}) {
  await send({
    to: providerEmail,
    subject: "Your ProFindly account has been suspended",
    html: layout(`
      ${h1("Account suspended")}
      ${p(`Hi ${providerName}, your ${SITE_NAME} account has been suspended.`)}
      ${p("If you think this is an error, please reply to this email and we'll look into it.")}
      ${badge("Suspended", "red")}
    `),
  });
}

export async function sendMediaApprovedEmail({
  providerEmail,
  providerName,
  items,
}: {
  providerEmail: string;
  providerName: string;
  items: string[];
}) {
  const list = items.map((i) => `<li style="margin:4px 0;font-size:14px;color:#374151;">${i}</li>`).join("");
  await send({
    to: providerEmail,
    subject: "Your profile update has been approved",
    html: layout(`
      ${h1("Profile update approved")}
      ${p(`Hi ${providerName}, the following changes to your profile have been approved and are now live:`)}
      <ul style="margin:12px 0;padding-left:20px;">${list}</ul>
      ${btn("View Profile", `${SITE_URL}/provider/dashboard`)}
    `),
  });
}

export async function sendMediaRejectedEmail({
  providerEmail,
  providerName,
  items,
  reason,
}: {
  providerEmail: string;
  providerName: string;
  items: string[];
  reason?: string | null;
}) {
  const list = items.map((i) => `<li style="margin:4px 0;font-size:14px;color:#374151;">${i}</li>`).join("");
  await send({
    to: providerEmail,
    subject: "Your profile update was not approved",
    html: layout(`
      ${h1("Profile update not approved")}
      ${p(`Hi ${providerName}, the following changes could not be approved:`)}
      <ul style="margin:12px 0;padding-left:20px;">${list}</ul>
      ${reason ? p(`<strong>Reason:</strong> ${reason}`) : ""}
      ${p("You can upload new media from your setup page. Reply to this email if you have questions.")}
      ${btn("Update Profile", `${SITE_URL}/provider/setup`)}
    `),
  });
}

export async function sendTrialStartedEmail({
  providerEmail,
  providerName,
  trialEndsAt,
}: {
  providerEmail: string;
  providerName: string;
  trialEndsAt: Date;
}) {
  const dateStr = trialEndsAt.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  await send({
    to: providerEmail,
    subject: "Your 14-day free trial has started",
    html: layout(`
      ${h1("Your free trial is active")}
      ${p(`Hi ${providerName}, welcome to ${SITE_NAME}! Your 14-day free trial started today.`)}
      ${p(`Your trial ends on <strong>${dateStr}</strong>. After that, your subscription will automatically continue — you can cancel anytime from your dashboard.`)}
      ${badge("Trial Active", "blue")}
      ${btn("Go to Dashboard", `${SITE_URL}/provider/dashboard`)}
    `),
  });
}

export async function sendTrialEndingSoonEmail({
  providerEmail,
  providerName,
  trialEndsAt,
}: {
  providerEmail: string;
  providerName: string;
  trialEndsAt: Date;
}) {
  const dateStr = trialEndsAt.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  await send({
    to: providerEmail,
    subject: "Your free trial ends in 3 days",
    html: layout(`
      ${h1("Trial ending soon")}
      ${p(`Hi ${providerName}, your free trial ends on <strong>${dateStr}</strong>.`)}
      ${p("After that, your subscription will continue automatically. Make sure your payment method is up to date.")}
      ${badge("3 Days Left", "yellow")}
      ${btn("Manage Subscription", `${SITE_URL}/provider/dashboard`)}
    `),
  });
}

export async function sendSubscriptionActiveEmail({
  providerEmail,
  providerName,
}: {
  providerEmail: string;
  providerName: string;
}) {
  await send({
    to: providerEmail,
    subject: "Your ProFindly subscription is active",
    html: layout(`
      ${h1("Subscription confirmed")}
      ${p(`Hi ${providerName}, your ${SITE_NAME} subscription is now active.`)}
      ${p("Your profile will remain visible to clients as long as your subscription is active. Invoices are sent automatically to your email.")}
      ${badge("Subscription Active", "green")}
      ${btn("Go to Dashboard", `${SITE_URL}/provider/dashboard`)}
    `),
  });
}

export async function sendSubscriptionExpiredEmail({
  providerEmail,
  providerName,
}: {
  providerEmail: string;
  providerName: string;
}) {
  await send({
    to: providerEmail,
    subject: "Your ProFindly subscription has ended",
    html: layout(`
      ${h1("Subscription ended")}
      ${p(`Hi ${providerName}, your ${SITE_NAME} subscription has been cancelled or expired.`)}
      ${p("Your profile is no longer visible to clients. You can reactivate at any time from your dashboard.")}
      ${badge("Subscription Ended", "red")}
      ${btn("Reactivate", `${SITE_URL}/provider/dashboard`)}
    `),
  });
}

export async function sendPaymentFailedEmail({
  providerEmail,
  providerName,
}: {
  providerEmail: string;
  providerName: string;
}) {
  await send({
    to: providerEmail,
    subject: "Payment failed — action required",
    html: layout(`
      ${h1("We couldn't process your payment")}
      ${p(`Hi ${providerName}, we were unable to charge your payment method for your ${SITE_NAME} subscription.`)}
      ${p("Please update your payment details to keep your profile active.")}
      ${badge("Payment Failed", "red")}
      ${btn("Update Payment", `${SITE_URL}/provider/dashboard`)}
    `),
  });
}

/** Legacy helper — keep for any existing callers */
export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await send({ to, subject, html });
}

export async function sendReferralInviteEmail({
  toEmail,
  referrerName,
  referralCode,
}: {
  toEmail: string;
  referrerName: string;
  referralCode: string;
}) {
  await send({
    to: toEmail,
    subject: `${referrerName} invited you to join ProFindly`,
    html: layout(`
      ${h1("You've been invited!")}
      ${p(`${referrerName} thinks you'd be a great fit for ProFindly — a marketplace connecting professional service providers with clients.`)}
      ${p("Join today and get your profile listed in front of clients actively looking for your services.")}
      ${badge("Exclusive Invite", "green")}
      ${btn("Join ProFindly →", `${SITE_URL}/ref/${referralCode}`)}
    `),
  });
}