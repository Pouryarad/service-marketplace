"use client";

import { useState } from "react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default function BioWriterModal() {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setBio("");
    setSaved(false);
    try {
      const res = await fetch("/api/ai/write-bio", { method: "POST" });
      const data = await res.json();
      if (data.bio) setBio(data.bio);
      else setError("Could not generate bio. Try again.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function saveBio() {
    setSaving(true);
    try {
      const res = await fetch("/api/ai/save-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setOpen(false), 1200);
      }
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); generate(); }}
        className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#f3f5f9] transition w-full text-left"
      >
        <span className="text-lg">✍️</span>
        <span className="text-sm font-medium text-[#1f1f1f]">Write Bio with AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1f1f1f]">AI Bio Writer</h2>
              <button onClick={() => setOpen(false)} className="text-[#9ca3af] hover:text-[#1f1f1f] text-xl leading-none">×</button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-[#9ca3af] py-8 justify-center">
                <span className="animate-spin">⏳</span> Generating your bio…
              </div>
            )}

            {!loading && bio && (
              <>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-black/10 p-3 text-sm text-[#1f1f1f] resize-none focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
                <p className="mt-1 text-xs text-[#9ca3af]">You can edit before saving.</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={generate}
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={saveBio}
                    disabled={saving || saved}
                    className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {saved ? "✅ Saved!" : saving ? "Saving…" : "Save to Profile"}
                  </button>
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}