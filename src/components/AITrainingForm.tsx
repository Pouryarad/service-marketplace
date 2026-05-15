"use client";

import { useState, useEffect } from "react";
import type { Provider } from "@/lib/types";

type QAItem = {
  id?: number;
  question: string;
  answer: string;
  ai_approved: boolean;
  ai_rejection_reason?: string | null;
};

export default function AITrainingForm({
  provider,
  existingQA,
}: {
  provider: Provider;
  existingQA: QAItem[];
}) {
  const storageKey = `ai_training_${provider.id}`;
  const answersKey = `ai_answers_${provider.id}`;

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results] = useState<QAItem[]>(existingQA.filter(q => q.ai_approved));
  const [rejected] = useState<QAItem[]>(existingQA.filter(q => !q.ai_approved && q.ai_rejection_reason));

  // Load saved questions and answers from localStorage
  useEffect(() => {
    const savedQuestions = localStorage.getItem(storageKey);
    const savedAnswers = localStorage.getItem(answersKey);
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, []);

  // Save answers to localStorage on change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(answersKey, JSON.stringify(answers));
    }
  }, [answers]);

  const generateQuestions = async (force = false) => {
    if (!force && questions.length > 0) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: provider.categoryName }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      localStorage.setItem(storageKey, JSON.stringify(data.questions ?? []));
      setAnswers({});
      localStorage.removeItem(answersKey);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmit = async () => {
    const filled = questions
      .map((q, i) => ({ question: q, answer: answers[i] ?? "" }))
      .filter((qa) => qa.answer.trim().length > 0);

    if (filled.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/screen-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          category: provider.categoryName,
          qa: filled,
        }),
      });
      await res.json();
      setSubmitted(true);
      localStorage.removeItem(answersKey);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04] text-center">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-black text-[#0f1117] mb-1">Answers Submitted</p>
        <p className="text-sm text-[#9ca3af]">Your AI profile has been updated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Existing approved answers */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
          <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Your Current AI Profile</p>
          <div className="space-y-3">
            {results.map((qa, i) => (
              <div key={i} className="border-b border-black/[0.04] pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-[#6b7280]">{qa.question}</p>
                <p className="text-sm text-[#0f1117] mt-1">{qa.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected answers */}
      {rejected.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Not Approved</p>
          <div className="space-y-3">
            {rejected.map((qa, i) => (
              <div key={i} className="border-b border-red-100 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-[#6b7280]">{qa.question}</p>
                <p className="text-sm text-red-600 mt-1">{qa.ai_rejection_reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate questions */}
      {questions.length === 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04] text-center">
          <p className="text-4xl mb-3">🤖</p>
          <p className="font-black text-[#0f1117] mb-1">Generate Your Questions</p>
          <p className="text-sm text-[#9ca3af] mb-4">
            We'll create {provider.categoryName}-specific questions to train the AI on your expertise.
          </p>
          <button
            onClick={() => generateQuestions(false)}
            disabled={loadingQuestions}
            className="rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loadingQuestions ? "Generating..." : "Generate Questions →"}
          </button>
        </div>
      )}

      {/* Questions form */}
      {questions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest">Answer the questions</p>
            <button
              onClick={() => generateQuestions(true)}
              disabled={loadingQuestions}
              className="text-xs font-bold text-[#2563eb] hover:underline disabled:opacity-50"
            >
              {loadingQuestions ? "Generating..." : "Regenerate"}
            </button>
          </div>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i}>
                <label className="text-sm font-bold text-[#0f1117] block mb-1.5">{q}</label>
                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Your answer (optional)"
                  className="w-full rounded-xl border border-black/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition resize-none min-h-20"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "Screening with AI..." : "Submit Answers"}
          </button>
        </div>
      )}
    </div>
  );
}