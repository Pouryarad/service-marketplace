"use client";

import { useFormStatus } from "react-dom";

export default function SubmitRequestButton({ isSuccess }: { isSuccess?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || isSuccess}
      className="w-full rounded-full bg-[#ff8a00] px-5 py-3 font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSuccess
        ? "Request Sent"
        : pending
        ? "Sending..."
        : "Request Contact"}
    </button>
  );
}