"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    const next = localStorage.getItem("next");

    if (next) {
      localStorage.removeItem("next");
      router.replace(next);
    }
  }, [router]);

  return null;
}