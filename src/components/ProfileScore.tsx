"use client";

import type { Provider } from "@/lib/types";

const items = [
  { key: "photo", label: "Profile photo", tip: "Add a profile photo in Edit Profile." },
  { key: "oneLiner", label: "One-liner", tip: "Add a one-liner description in Edit Profile." },
  { key: "bio", label: "Bio", tip: "Write a bio in Edit Profile — use AI to help!" },
  { key: "portfolio", label: "Portfolio photo", tip: "Upload at least one portfolio photo in Edit Profile." },
  { key: "youtube", label: "YouTube intro", tip: "Add a YouTube intro video in Edit Profile." },
  { key: "aiTraining", label: "AI Training", tip: "Complete your AI training so the search can match you better." },
];

function getChecks(provider: Provider) {
  return {
    photo: !!provider.profilePhotoUrl,
    oneLiner: !!provider.oneLine,
    bio: !!provider.bio,
    portfolio: (provider.portfolioPhotoUrls?.length ?? 0) > 0,
    youtube: !!provider.videoUrl,
    aiTraining: !!provider.aiTrainedAt,
  };
}

export default function ProfileScore({ provider }: { provider: Provider }) {
  const checks = getChecks(provider);
  const score = Object.values(checks).filter(Boolean).length;
  const total = 6;
  const pct = Math.round((score / total) * 100);

  const color =
    score <= 2 ? "#ef4444" :
    score <= 4 ? "#f59e0b" :
    "#22c55e";

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1f1f1f]">Profile Score</h2>
        <span className="text-sm font-bold" style={{ color }}>{score}/{total}</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-[#f3f5f9] overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const done = checks[item.key as keyof typeof checks];
          return (
            <li key={item.key} className="flex items-start gap-2">
              <span className={`mt-0.5 text-sm ${done ? "text-green-500" : "text-[#d1d5db]"}`}>
                {done ? "✓" : "○"}
              </span>
              <div>
                <p className={`text-xs font-medium ${done ? "text-[#1f1f1f]" : "text-[#9ca3af]"}`}>
                  {item.label}
                </p>
                {!done && (
                  <p className="text-xs text-[#9ca3af]">{item.tip}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}