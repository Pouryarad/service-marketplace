"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthRefresh() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !sessionStorage.getItem("refreshed")) {
        sessionStorage.setItem("refreshed", "1");
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}