"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Heart, LogOut, User, Bell } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import type { ProviderRequest } from "@/lib/types";

export default function BottomNav({
    variant = "public",
    providerRequests = [],
}: {
    variant?: "public" | "dashboard" | "provider" | "admin";
    providerRequests?: ProviderRequest[];
}) {
    const pathname = usePathname();
    const newCount = providerRequests.filter((r) => r.status === "new").length;

    const itemClass = (path: string) =>
        `flex flex-col items-center text-xs ${pathname === path ? "text-black" : "text-gray-400"
        }`;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white sm:hidden">
            <div className="flex justify-around py-2">

                {variant !== "provider" && variant !== "admin" && (
                    <Link href="/" className={itemClass("/")}>
                        <Home size={20} />
                        Home
                    </Link>
                )}

                {variant === "dashboard" && (
                    <Link href="/dashboard" className={itemClass("/dashboard")}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                )}

                {variant === "dashboard" && (
                    <Link href="/dashboard/requests" className={itemClass("/dashboard/requests")}>
                        <Heart size={20} />
                        Requests
                    </Link>
                )}

                {variant === "provider" && (
                    <Link href="/provider/dashboard" className={itemClass("/provider/dashboard")}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                )}

                {variant === "provider" && (
                    <Link
                        href="/provider/requests"
                        className={`relative flex flex-col items-center text-xs ${pathname === "/provider/requests" ? "text-black" : "text-gray-400"
                            }`}
                    >
                        <div className="relative">
                            <Bell size={20} />
                            {newCount > 0 && (
                                <span className="absolute -right-2 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                    {newCount}
                                </span>
                            )}
                        </div>
                        Requests
                    </Link>
                )}

                {variant === "admin" && (
                    <Link href="/admin" className={itemClass("/admin")}>
                        <LayoutDashboard size={20} />
                        Overview
                    </Link>
                )}

                {variant === "admin" && (
                    <Link href="/admin/users" className={itemClass("/admin/users")}>
                        <User size={20} />
                        Users
                    </Link>
                )}

                {variant === "admin" && (
                    <Link href="/admin/approvals" className={itemClass("/admin/approvals")}>
                        <Bell size={20} />
                        Approvals
                    </Link>
                )}

                {variant === "public" ? (
                    <>
                        <AuthModal
                            role="client"
                            trigger={
                                <div className="flex flex-col items-center text-xs text-gray-400">
                                    <User size={20} />
                                    Sign in
                                </div>
                            }
                        />
                        <AuthModal
                            role="provider"
                            trigger={
                                <div className="flex flex-col items-center text-xs text-[#ff8a00] font-semibold">
                                    <LayoutDashboard size={20} />
                                    Provider
                                </div>
                            }
                        />
                    </>
                ) : (
                    <form action="/auth/logout" method="post" onSubmit={() => localStorage.clear()} className="flex flex-col items-center text-xs text-gray-400">
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