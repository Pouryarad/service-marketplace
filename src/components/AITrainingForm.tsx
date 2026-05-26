"use client";

import { useState, useEffect } from "react";
import type { Provider } from "@/lib/types";

type QAItem = {
  id?: number;
  question: string;
  answer: string | null;
  ai_approved: boolean;
  ai_rejection_reason?: string | null;
  answered_at?: string | null;
};

function isLocked(answeredAt?: string | null, aiApproved?: boolean): boolean {
  if (!answeredAt || !aiApproved) return false;
  return Date.now() - new Date(answeredAt).getTime() < 30 * 24 * 60 * 60 * 1000;
}

function daysUntilUnlock(answeredAt?: string | null): number {
  if (!answeredAt) return 0;
  const diff = 30 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(answeredAt).getTime());
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export default function AITrainingForm({
  provider,
  existingQA,
}: {
  provider: Provider;
  existingQA: QAItem[];
}) {
  const [questions, setQuestions] = useState<QAItem[]>(existingQA);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingQA.length === 0) generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: provider.categoryName, providerId: provider.id }),
      });
      const data = await res.json();
      if (data.existing?.length > 0) {
        setQuestions(data.existing);
      } else if (data.questions?.length > 0 && !data.error) {
        window.location.reload();
      } else {
        setError(data.error ?? "Failed to generate questions. Please refresh the page.");
        setLoadingQuestions(false);
      }
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmit = async () => {
    const toSubmit = questions
      .filter((q) => !isLocked(q.answered_at, q.ai_approved) && answers[q.id!]?.trim())
      .map((q) => ({ id: q.id, question: q.question, answer: answers[q.id!] }));

    if (toSubmit.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/screen-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          category: provider.categoryName,
          qa: toSubmit,
        }),
      });
      const data = await res.json();
      if (data.ok) window.location.reload();
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04] text-center">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-black text-[#0f1117] mb-1">Answers Submitted</p>
        <p className="text-sm text-[#9ca3af] mb-4">Your answers have been screened and saved. They are now locked for 30 days.</p>
        <a href="/provider/dashboard" className="inline-block rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
          Go to Dashboard
        </a>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04] text-center">
        <p className="text-3xl mb-3">🤖</p>
        <p className="font-black text-[#0f1117] mb-1">Generating your questions...</p>
        <p className="text-sm text-[#9ca3af]">This only happens once. Please wait.</p>
      </div>
    );
  }

  const hasUnlocked = questions.some((q) => !isLocked(q.answered_at, q.ai_approved));

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <p className="text-sm font-bold text-amber-700">⚠️ Read before answering</p>
        <p className="text-xs text-amber-600 mt-1">Each answer locks for 30 days after saving. Make sure your answers are accurate, professional, and helpful for clients searching for your services.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04] space-y-5">
          {questions.map((q, i) => {
            const locked = isLocked(q.answered_at, q.ai_approved);
            const days = daysUntilUnlock(q.answered_at);
            return (
              <div key={q.id ?? i} className={`${i < questions.length - 1 ? "border-b border-black/[0.04] pb-5" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <label className="text-sm font-bold text-[#0f1117]">{q.question}</label>
                  {locked && (
                    <span className="shrink-0 text-xs bg-[#f3f5f9] text-[#9ca3af] px-2 py-0.5 rounded-full font-medium">
                      🔒 {days}d
                    </span>
                  )}
                </div>
                {locked ? (
                  <div className="w-full rounded-xl border border-black/[0.06] bg-[#f9f9f9] p-3 text-sm text-[#6b7280]">
                    {q.answer ?? "—"}
                  </div>
                ) : (
                  <>
                    <textarea
                      value={answers[q.id!] ?? q.answer ?? ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id!]: e.target.value }))}
                      placeholder="Your answer..."
                      className="w-full rounded-xl border border-black/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition resize-none min-h-20"
                    />
                    {q.answered_at && !q.ai_approved && (
                      <p className="text-xs text-red-500 mt-1">⚠️ Your previous answer didn't pass our quality check. Please try again with a more relevant and professional response.</p>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {hasUnlocked && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Screening with AI..." : "Save Answers"}
            </button>
          )}

          {!hasUnlocked && (
            <p className="text-center text-sm text-[#9ca3af]">
              All answers are locked. Come back in {Math.min(...questions.map(q => daysUntilUnlock(q.answered_at)))} days to update.
            </p>
          )}
        </div>
      )}
    </div>
  );
}