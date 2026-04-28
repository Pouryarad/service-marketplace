"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
      },
    });
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#1f1f1f]">Sign in</h2>

            <p className="mt-2 text-sm text-gray-500">
              Continue with Google to contact this provider.
            </p>

            <button
              onClick={handleGoogleLogin}
              className="mt-5 w-full inline-flex items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 font-semibold text-[#1f1f1f] hover:bg-gray-50 transition"
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
        </div>
      )}
    </>
  );
}