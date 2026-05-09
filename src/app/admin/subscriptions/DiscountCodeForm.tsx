"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

function generateCode(name: string) {
  const prefix = name.trim().slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X").padEnd(3, "X");
  const num = Math.floor(10 + Math.random() * 90);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}${num}-${suffix}`;
}

export default function DiscountCodeForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [duration, setDuration] = useState<"once" | "repeating" | "forever">("once");
  const [months, setMonths] = useState("3");
  const [maxUses, setMaxUses] = useState("");
  const [redeemBy, setRedeemBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate code when name changes
  useEffect(() => {
    if (name.trim().length >= 2) {
      setCode(generateCode(name));
    }
  }, [name]);

  const handleSubmit = async () => {
    setError("");
    setSaving(true);
    const res = await fetch("/admin/create-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        code,
        type,
        value: Number(value),
        duration,
        months: Number(months),
        maxUses: maxUses ? Number(maxUses) : null,
        redeemBy: redeemBy || null,
      }),
    });
    if (res.ok) {
      setSuccess(true);
      setName("");
      setCode("");
      setValue("");
      setMaxUses("");
      setRedeemBy("");
      setDuration("once");
      setMonths("3");
      setType("percent");
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to create coupon");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700">✅ Coupon created!</p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700">❌ {error}</p>
      )}

      {/* Name + Code */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Coupon Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Launch Special"
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Promo Code</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Auto-generated"
              className="h-10 flex-1 rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb] font-mono"
            />
            <button
              type="button"
              onClick={() => setCode(generateCode(name || "FIN"))}
              className="size-10 shrink-0 rounded-xl border border-black/10 flex items-center justify-center hover:bg-[#f0f2f7] transition"
              title="Regenerate code"
            >
              <RefreshCw size={14} className="text-[#6b7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Type + Value + Duration */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]">
            <option value="percent">% Off</option>
            <option value="fixed">$ Off</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">
            {type === "percent" ? "Percent" : "Amount (CAD)"}
          </label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
            placeholder={type === "percent" ? "50" : "5"}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value as "once" | "repeating" | "forever")}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]">
            <option value="once">Once</option>
            <option value="repeating">Months</option>
            <option value="forever">Forever</option>
          </select>
        </div>
        {duration === "repeating" && (
          <div>
            <label className="block text-xs font-bold text-[#6b7280] mb-1">How Many Months</label>
            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} min="1"
              className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]" />
          </div>
        )}
      </div>

      {/* Max Uses + Redeem By */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Max Uses <span className="font-normal text-[#c4c9d4]">(optional)</span></label>
          <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Unlimited"
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Redeem By <span className="font-normal text-[#c4c9d4]">(optional)</span></label>
          <input type="date" value={redeemBy} onChange={(e) => setRedeemBy(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]" />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={saving || !name || !value || !code}
        className="w-full rounded-xl bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60">
        {saving ? "Creating..." : "Create Coupon"}
      </button>
    </div>
  );
}