"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { createPortal } from "react-dom";

export default function AuthModal({
  trigger,
  next = "/",
  role,
}: {
  trigger: React.ReactNode;
  next?: string;
  role?: "client" | "provider";
}) {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    const redirectNext = role === "provider"
      ? "/provider/dashboard"
      : window.location.pathname + window.location.search;

    localStorage.setItem("next", redirectNext);
    localStorage.setItem("pendingRole", role === "provider" ? "provider" : "client");
    document.cookie = `auth_next=${encodeURIComponent(redirectNext)}; path=/; max-age=300`;
    document.cookie = `auth_pending_role=${role === "provider" ? "provider" : "client"}; path=/; max-age=300`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectNext)}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#1f1f1f]">
                {role === "provider" ? "Join as a Provider" : "Sign in"}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {role === "provider"
                  ? "Create your provider profile and start getting clients."
                  : "Continue with Google to access your account."}
              </p>
              <label className="flex items-start gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-xs text-[#6b7280]">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" className="underline text-[#0f1117]">Terms & Conditions</a>,{" "}
                  <a href="/privacy" target="_blank" className="underline text-[#0f1117]">Privacy Policy</a>, and{" "}
                  <a href="/cookies" target="_blank" className="underline text-[#0f1117]">Cookie Policy</a>.
                </span>
              </label>
              <button
                onClick={handleGoogleLogin}
                disabled={!agreed}
                className="mt-5 w-full inline-flex items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 font-semibold text-[#1f1f1f] hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  className="h-5 w-5"
                />
                Continue with Google
              </button>
              <button
                onClick={() => setOpen(false)}
                className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}