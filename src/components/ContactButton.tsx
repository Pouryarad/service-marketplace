"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type Props = {
  type: "email" | "phone";
  value: string;
  providerId: number;
};

export default function ContactButton({ type, value, providerId }: Props) {
  const [revealed, setRevealed] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleClick = async () => {
    // track ONLY first reveal
    if (!revealed) {
      await supabase.from("provider_events").insert({
        provider_id: providerId,
        event_type: type === "email" ? "reveal_email" : "reveal_phone",
      });

      setRevealed(true);
      return;
    }

    // second click → open contact
    if (type === "email") {
      window.location.href = `mailto:${value}`;
    } else {
      window.location.href = `tel:${value}`;
    }
  };

  const isEmail = type === "email";

  return (
    <button
      onClick={handleClick}
      className={`w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 ${
        revealed ? "py-2" : "py-3"
      } font-bold text-white hover:bg-[#1e4fd6] transition`}
    >
      {!revealed ? (
        <>
          {isEmail ? <Mail size={18} /> : <Phone size={18} />}
          {isEmail ? "Reveal Email" : "Reveal Phone"}
        </>
      ) : (
        <>
          {isEmail ? <Mail size={18} /> : <Phone size={18} />}
          <span className="text-sm break-all text-center leading-tight">
            {value}
          </span>
        </>
      )}
    </button>
  );
}