"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Heart, LogOut, User } from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function BottomNav({
  variant = "public",
}: {
  variant?: "public" | "dashboard" | "provider" | "admin";
}) {
  const pathname = usePathname();

  const itemClass = (path: string) =>
    `flex flex-col items-center text-xs ${
      pathname === path ? "text-black" : "text-gray-400"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white sm:hidden">
      <div className="flex justify-around py-2">

        {/* Home */}
        {variant !== "provider" && (
          <Link href="/" className={itemClass("/")}>
            <Home size={20} />
            Home
          </Link>
        )}

        {/* Dashboard */}
        {variant === "dashboard" && (
          <Link href="/dashboard" className={itemClass("/dashboard")}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
        )}

        {/* Requests */}
        {variant === "dashboard" && (
          <Link href="/dashboard/requests" className={itemClass("/dashboard/requests")}>
            <Heart size={20} />
            Requests
          </Link>
        )}

        {/* Provider */}
        {variant === "provider" && (
          <Link href="/provider/dashboard" className={itemClass("/provider/dashboard")}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
        )}

        {/* Public (signed out) */}
        {variant === "public" ? (
          <>
  {/* Sign in (client) */}
  <AuthModal
    next="/"
    trigger={
      <div className="flex flex-col items-center text-xs text-gray-400">
        <User size={20} />
        Sign in
      </div>
    }
  />

  {/* Provider */}
  <AuthModal
    next="/provider/start"
    trigger={
      <div className="flex flex-col items-center text-xs text-[#ff8a00] font-semibold">
        <LayoutDashboard size={20} />
        Provider
      </div>
    }
  />
</>
        ) : (
          <form action="/auth/logout" method="post" className="flex flex-col items-center text-xs text-gray-400">
            <button type="submit" className="flex flex-col items-center">
              <LogOut size={20} />
              Sign out
            </button>
          </form>
        )}
      </div>
    </div>
  );
}