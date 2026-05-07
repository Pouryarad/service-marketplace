import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Tag,
  CreditCard,
  BarChart2,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/insights", label: "Insights", icon: BarChart2 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase!
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#f3f5f9] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-black/5 fixed top-0 left-0 h-screen z-40">
        <div className="p-5 border-b border-black/5">
          <Image src="/logo.png" alt="ProFindly" width={120} height={32} className="h-8 w-auto" />
          <p className="mt-1 text-xs text-[#9ca3af] font-medium">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6b7280] hover:bg-[#f3f5f9] hover:text-[#1f1f1f] transition"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-black/5">
          <Link
            href="/auth/logout"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={17} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-black/5 px-4 py-3">
          <Image src="/logo.png" alt="ProFindly" width={100} height={28} className="h-7 w-auto" />
          <span className="text-xs font-bold text-[#9ca3af]">Admin</span>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden flex overflow-x-auto gap-1 bg-white border-b border-black/5 px-3 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#6b7280] hover:bg-[#f3f5f9] transition"
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}