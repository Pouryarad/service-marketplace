"use client";

import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { Logo } from "./logo";
import AuthModal from "@/components/AuthModal";
import { useState, useRef, useEffect } from "react";
import type { ProviderRequest } from "@/lib/types";

export function TopNav({
  variant = "public",
  providerRequests = [],
}: {
  variant?: "public" | "dashboard" | "provider" | "admin";
  providerRequests?: ProviderRequest[];
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const newRequests = providerRequests.filter((r) => r.status === "new");
  const badgeCount = newRequests.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="hidden sm:block sticky top-0 z-50 bg-[#f3f5f9]/80 backdrop-blur border-b border-black/5">
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

              {/* Bell with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="relative grid size-10 place-items-center rounded-full hover:bg-white"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {badgeCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white leading-none">
                      {badgeCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-black/10 bg-white shadow-xl">
                    <div className="border-b border-black/5 px-4 py-3">
                      <p className="font-bold text-[#1f1f1f]">New Requests</p>
                    </div>
                    {newRequests.length === 0 ? (
                      <p className="px-4 py-5 text-sm text-[#6b7280]">
                        No new requests.
                      </p>
                    ) : (
                      <ul className="max-h-[272px] overflow-y-auto">
                        {newRequests.map((req) => (
                          <li key={req.id}>
                            <Link
                              href={`/provider/requests?id=${req.id}`}
                              onClick={() => setDropdownOpen(false)}
                              className="flex flex-col gap-1 px-4 py-3 hover:bg-[#f3f5f9] transition"
                            >
                              <p className="text-sm font-bold text-[#1f1f1f]">
                                {req.clientName}
                              </p>
                              <p className="text-xs text-[#6b7280] line-clamp-2">
                                {req.message}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="border-t border-black/5 px-4 py-3">
                      <Link
                        href="/provider/requests"
                        onClick={() => setDropdownOpen(false)}
                        className="text-sm font-bold text-[#2563eb] hover:underline"
                      >
                        View all requests →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

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