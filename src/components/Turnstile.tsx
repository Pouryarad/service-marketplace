"use client";

import { useEffect, useRef } from "react";

export default function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.turnstile && ref.current && !widgetId.current) {
        // @ts-ignore
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        });

        clearInterval(interval);
      }
    }, 300);

    return () => {
      clearInterval(interval);

      // CLEAN UP (this fixes your error)
      // @ts-ignore
      if (window.turnstile && widgetId.current) {
        // @ts-ignore
        window.turnstile.remove(widgetId.current);
      }
    };
  }, []);

  return <div ref={ref} />;
}