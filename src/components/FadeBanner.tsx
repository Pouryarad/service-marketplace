"use client";

import { useEffect, useState } from "react";

export default function FadeBanner({ message, type }: { message: string; type: "green" | "blue" }) {
  const [opacity, setOpacity] = useState(1);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fade = setTimeout(() => setOpacity(0), 2500);
    const hide = setTimeout(() => setShow(false), 3200);
    return () => { clearTimeout(fade); clearTimeout(hide); };
  }, []);

  if (!show) return null;

  const styles = type === "green"
    ? "bg-green-50 border-green-200 text-green-700"
    : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div
      style={{ opacity, transition: "opacity 700ms ease" }}
      className={`mt-4 rounded-2xl border px-5 py-3 text-sm font-medium ${styles}`}
    >
      {message}
    </div>
  );
}