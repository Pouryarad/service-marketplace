"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SetupRolePage() {
  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/"; return; }

      const pendingRole = localStorage.getItem("pendingRole") ?? "client";
      console.log("pendingRole from localStorage:", pendingRole);
      localStorage.removeItem("pendingRole");

await supabase.from("profiles").upsert({
        id: user.id,
        role: pendingRole,
        full_name: user.user_metadata?.full_name ?? "",
      }, { onConflict: "id" });

      if (pendingRole === "provider") {
        window.location.href = "/provider/setup";
      } else {
        window.location.href = "/";
      }
    };

    run();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
      <p className="text-sm text-[#9ca3af]">Setting up your account...</p>
    </main>
  );
}