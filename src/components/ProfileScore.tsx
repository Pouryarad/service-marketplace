"use client";

import type { Provider } from "@/lib/types";
import Link from "next/link";

export default function ProfileScore({ provider }: { provider: Provider }) {
  const score = provider.profileScore ?? 0;
  const feedback: { field: string; message: string }[] = provider.profileFeedback ?? [];

  const color =
    score < 50 ? "#ef4444" :
    score < 75 ? "#f59e0b" :
    score < 90 ? "#2563eb" :
    "#22c55e";

  const label =
    score < 50 ? "Needs work" :
    score < 75 ? "Getting there" :
    score < 90 ? "Looking good" :
    "Complete";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference - (score / 100) * circumference;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-bold text-[#1f1f1f]">Profile Score</h2>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r={radius} fill="none" stroke="#f3f5f9" strokeWidth="8" />
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={filled}
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#1f1f1f] leading-none">{score}</span>
            <span className="text-[10px] text-[#9ca3af] mt-0.5">/ 100</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold" style={{ color }}>{label}</p>
          {feedback.length === 0 ? (
            <p className="text-xs text-[#9ca3af] mt-1">Your profile is fully optimized!</p>
          ) : (
            <p className="text-xs text-[#9ca3af] mt-1">{feedback.length} thing{feedback.length > 1 ? "s" : ""} to improve</p>
          )}
          <Link href="/provider/setup" className="mt-2 inline-block text-xs font-medium text-[#2563eb] hover:underline">
            Edit profile →
          </Link>
        </div>
      </div>

      {feedback.length > 0 && (
        <ul className="mt-4 space-y-2">
          {feedback.map((item, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-[#f3f5f9] px-3 py-2">
              <span className="mt-0.5 text-xs font-bold text-[#9ca3af] shrink-0">!</span>
              <div>
                <p className="text-xs font-semibold text-[#1f1f1f]">{item.field}</p>
                <p className="text-xs text-[#9ca3af]">{item.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}