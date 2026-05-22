"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const next = localStorage.getItem("next");
      if (!next) return;
      // Only redirect if recently set (within last 5 minutes)
      const nextTime = localStorage.getItem("next_time");
      if (!nextTime || Date.now() - Number(nextTime) > 5 * 60 * 1000) {
        localStorage.removeItem("next");
        localStorage.removeItem("next_time");
        return;
      }
      localStorage.removeItem("next");
      localStorage.removeItem("next_time");

      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role;

      // Prevent client from going to provider-only routes
      if (role === "client" && (
        next.startsWith("/provider/dashboard") ||
        next.startsWith("/provider/setup") ||
        next.startsWith("/provider/requests")
      )) {
        router.replace("/dashboard");
        return;
      }

      // Prevent provider from going to client routes
      if (role === "provider" && next.startsWith("/dashboard")) {
        router.replace("/provider/dashboard");
        return;
      }

      router.replace(next);
    };

    run();
  }, [router]);

  return null;
}