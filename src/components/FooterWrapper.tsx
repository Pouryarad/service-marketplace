"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const [chatMode, setChatMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setChatMode(document.body.hasAttribute("data-chat"));
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (pathname !== "/" || chatMode) return null;
  return <Footer />;
}