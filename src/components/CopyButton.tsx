"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 size-7 rounded-lg bg-[#f3f5f9] flex items-center justify-center hover:bg-[#e8edf5] transition"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-[#9ca3af]" />}
    </button>
  );
}