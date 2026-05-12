"use client";

import { useState } from "react";

export default function ReferralButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/ref/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="rounded-full bg-[#ff8a00] px-4 py-2 text-sm font-bold text-white shadow hover:bg-orange-600 transition"
    >
      {copied ? "✅ Copied!" : "🎁 Refer & Earn"}
    </button>
  );
}