import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { Logo } from "./logo";

export function TopNav({
  variant = "public",
  badgeCount = 0,
}: {
  variant?: "public" | "dashboard" | "provider" | "admin";
  badgeCount?: number;
}) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-end px-4 py-5 sm:px-6">
      <nav className="flex items-center gap-3 text-sm font-medium text-[#1f1f1f]">

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
        )}
        {variant === "provider" ? (
          <form action="/auth/logout" method="post">
            <button className="grid size-10 place-items-center rounded-full hover:bg-white" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </form>
        ) : (
          <Link className="rounded-full px-3 py-2 hover:bg-white" href="/auth/sign-in">
            Sign in
          </Link>
        )}
        {variant === "public" && (
          <Link
            href="/auth/sign-in?next=/onboarding"
            className="rounded-full bg-[#ff8a00] px-4 py-2 font-semibold text-white transition hover:bg-[#eb7e00]"
          >
            Get Clients
          </Link>
        )}
      </nav>
    </header>
  );
}
