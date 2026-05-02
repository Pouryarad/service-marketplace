"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      router.replace(`/auth/callback?${searchParams.toString()}`);
    }
  }, [searchParams, router]);

  return null;
}