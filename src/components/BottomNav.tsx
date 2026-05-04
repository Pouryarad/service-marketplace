"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Heart, User } from "lucide-react";
import { LogOut } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const itemClass = (path: string) =>
    `flex flex-col items-center text-xs ${
      pathname === path ? "text-black" : "text-gray-400"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white sm:hidden">
      <div className="flex justify-around py-2">
        
        <Link href="/" className={itemClass("/")}>
          <Home size={20} />
          Home
        </Link>

        <Link href="/dashboard" className={itemClass("/dashboard")}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link href="/dashboard/requests" className={itemClass("/dashboard/requests")}>
          <Heart size={20} />
          Requests
        </Link>

<form action="/auth/logout" method="post" className="flex flex-col items-center text-xs text-gray-400">
  <button type="submit" className="flex flex-col items-center">
    <LogOut size={20} />
    Sign out
  </button>
</form>

      </div>
    </div>
  );
}