"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null;
}