"use client";

import { useEffect } from "react";

export default function ProfileScoreTrigger({ providerId }: { providerId: number }) {
  useEffect(() => {
    fetch("/api/ai/analyze-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId }),
    }).catch(() => {});
  }, [providerId]);

  return null;
}