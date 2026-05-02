"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Logo } from "./logo";
import AuthModal from "@/components/AuthModal";


export function TopNav({
  variant = "public",
  badgeCount = 0,
}: {
  variant?: "public" | "dashboard" | "provider" | "admin";
  badgeCount?: number;
}) {

  return (
    <header className="sticky top-0 z-50 bg-[#f3f5f9]/80 backdrop-blur border-b border-black/5">
  <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-5 sm:px-6">
        <Logo />
      <nav className="ml-auto flex items-center gap-3 text-sm font-medium text-[#1f1f1f]">
          {variant !== "provider" && (
  <Link href="/" className="rounded-full px-3 py-2 hover:bg-white">
    Home
  </Link>
)}
{variant === "dashboard" && (
  <Link className="rounded-full px-3 py-2 hover:bg-white" href="/dashboard">
    Dashboard
  </Link>
)}

        {variant === "admin" && (
          <Link className="rounded-full px-3 py-2 hover:bg-white" href="/admin">
            Admin
          </Link>
        )}
        {variant === "provider" && (
  <>
    <Link
      className="rounded-full px-3 py-2 hover:bg-white"
      href="/provider/dashboard"
    >
      Dashboard
    </Link>

    <Link
      className="relative grid size-10 place-items-center rounded-full hover:bg-white"
      href="/provider/dashboard"
      aria-label="Notifications"
    >
      <Bell size={18} />
      {badgeCount > 0 && (
        <span className="absolute right-2 top-2 size-2.5 rounded-full bg-red-500" />
      )}
    </Link>

    <form action="/auth/logout" method="post">
      <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white">
        <LogOut size={16} /> Sign out
      </button>
    </form>
  </>
)}
       {variant === "public" ? (
  <AuthModal
    next="/"
    trigger={
      <span className="text-[#1f1f1f] font-medium cursor-pointer hover:underline">
        Sign in
      </span>
    }
  />
) : variant !== "provider" ? (
  <form action="/auth/logout" method="post">
    <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white">
      <LogOut size={16} /> Sign out
    </button>
  </form>
) : null}
        {variant === "public" && (
          <AuthModal
  next="/provider/start"
  trigger={
    <div className="rounded-full bg-[#ff8a00] px-4 py-2 font-semibold text-white cursor-pointer hover:bg-[#eb7e00]">
      Get Clients
    </div>
  }
/>
        )}
      </nav>
      </div>
    </header>
  );
}
