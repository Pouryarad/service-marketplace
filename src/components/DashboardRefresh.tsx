"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRefresh() {
  const router = useRouter();

  useEffect(() => {
    let lastActivity = Date.now();
    const onActivity = () => { lastActivity = Date.now(); };

    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("click", onActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 10000) {
        router.refresh();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("click", onActivity);
    };
  }, [router]);

  return null;
}