"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { sendReferralInvite } from "@/lib/actions";

export default function ReferralModal({
  code,
  name,
}: {
  code: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const url = typeof window !== "undefined" ? `${window.location.origin}/ref/${code}` : `/ref/${code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    const formData = new FormData();
    formData.set("email", email);
    formData.set("referrerName", name);
    formData.set("referralCode", code);
    const result = await sendReferralInvite(formData);
    setSending(false);
    if ((result as any)?.error) {
      setError("Failed to send. Try again.");
    } else {
      setSent(true);
      setEmail("");
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#ff8a00] px-4 py-2 text-sm font-bold text-white shadow hover:bg-orange-600 transition"
      >
        🎁 Refer & Earn
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top banner */}
            <div className="bg-[#0f1117] px-6 pt-6 pb-8 relative">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition text-lg font-light"
              >
                ✕
              </button>
              <p className="text-xs font-bold tracking-widest text-[#ff8a00] uppercase mb-2">Referral Program</p>
              <h2 className="text-2xl font-black text-white leading-tight">
                Invite colleagues.<br />Earn real discounts.
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Every provider you refer who subscribes earns you a discount on your next invoice.
              </p>

              {/* Reward tiers */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { n: "1", label: "referral", pct: "20%" },
                  { n: "3", label: "referrals", pct: "60%" },
                  { n: "5+", label: "referrals", pct: "100%" },
                ].map((tier) => (
                  <div key={tier.n} className="rounded-xl bg-white/[0.07] px-3 py-2.5 text-center">
                    <p className="text-lg font-black text-white">{tier.pct}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{tier.n} {tier.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">

              {/* Copy link */}
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#9ca3af] uppercase mb-2">Your Referral Link</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2.5 text-xs font-mono text-[#6b7280] truncate">
                    {url}
                  </div>
                  <button
                    onClick={copy}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-[#0f1117] text-white hover:bg-[#1f2937]"
                    }`}
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-black/[0.06]" />
                <span className="text-xs text-[#9ca3af]">or invite by email</span>
                <div className="h-px flex-1 bg-black/[0.06]" />
              </div>

              {/* Email invite */}
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#9ca3af] uppercase mb-2">Send Invite</p>
                <form onSubmit={handleSendEmail} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="colleague@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#2563eb] transition bg-white"
                  />
                  <button
                    type="submit"
                    disabled={sending || !email}
                    className="shrink-0 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-40"
                  >
                    {sending ? "Sending..." : sent ? "Sent ✓" : "Send"}
                  </button>
                </form>
                {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
                <p className="mt-2 text-xs text-[#c4c9d4]">
                  Email invites activate once hosting is configured.
                </p>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}