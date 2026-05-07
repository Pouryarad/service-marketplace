"use client";

import { useState } from "react";

export default function DiscountCodeForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [duration, setDuration] = useState<"once" | "repeating" | "forever">("once");
  const [months, setMonths] = useState("3");
  const [maxUses, setMaxUses] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/create-coupon", {
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
      }),
    });
    if (res.ok) {
      setSuccess(true);
      setName(""); setCode(""); setValue(""); setMaxUses("");
      setTimeout(() => { setSuccess(false); window.location.reload(); }, 1500);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          ✅ Coupon created!
        </p>
      )}

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
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Promo Code (optional)</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. LAUNCH50"
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb] font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]"
          >
            <option value="percent">% Off</option>
            <option value="fixed">$ Off</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">
            {type === "percent" ? "Percent" : "Amount (CAD)"}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "percent" ? "50" : "5"}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as "once" | "repeating" | "forever")}
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]"
          >
            <option value="once">Once</option>
            <option value="repeating">Months</option>
            <option value="forever">Forever</option>
          </select>
        </div>
        {duration === "repeating" && (
          <div>
            <label className="block text-xs font-bold text-[#6b7280] mb-1">Months</label>
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-[#6b7280] mb-1">Max Uses</label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Unlimited"
            className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#2563eb]"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || !name || !value}
        className="w-full rounded-xl bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
      >
        {saving ? "Creating..." : "Create Coupon"}
      </button>
    </div>
  );
}