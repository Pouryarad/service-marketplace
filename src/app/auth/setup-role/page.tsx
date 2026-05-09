"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SetupRolePage() {
  const [conflict, setConflict] = useState<"client" | "provider" | null>(null);
  

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/"; return; }

      const pendingRole = localStorage.getItem("pendingRole") ?? "client";


      // Check existing role
      const { data: existing } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();


      // If they already have a conflicting role, show modal
      if (existing?.role && existing.role !== pendingRole && existing.role !== "admin") {
        setConflict(existing.role as "client" | "provider");
        return;
      }

      // New user or same role — upsert and redirect
      await supabase.from("profiles").upsert({
        id: user.id,
        role: pendingRole,
        full_name: user.user_metadata?.full_name ?? "",
      }, { onConflict: "id" });

      if (pendingRole === "provider") {
        window.location.href = "/provider/setup";
      } else {
        window.location.href = "/dashboard";
      }
    };

    run();
  }, []);

  if (conflict === "client") {
    return (
      <main className="min-h-screen bg-[#f3f5f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-black text-[#0f1117] mb-2">Already a Client</h2>
          <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
            This Google account is registered as a <strong>client</strong>. To become a provider, please sign up with a different account.
          </p>
          <div className="flex flex-col gap-2">
            <a href="/dashboard"
              className="w-full rounded-xl bg-[#0f1117] py-3 text-sm font-bold text-white text-center">
              Go to Dashboard
            </a>
            <a href="/"
              className="w-full rounded-xl border border-black/10 py-3 text-sm font-bold text-[#6b7280] text-center">
              Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (conflict === "provider") {
    return (
      <main className="min-h-screen bg-[#f3f5f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-xl font-black text-[#0f1117] mb-2">Already a Provider</h2>
          <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
            This Google account is registered as a <strong>provider</strong>. Please use the provider login.
          </p>
          <a href="/provider/dashboard"
            className="w-full rounded-xl bg-[#0f1117] py-3 text-sm font-bold text-white text-center block">
            Go to Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
      <p className="text-sm text-[#9ca3af]">Setting up your account...</p>
    </main>
  );
}