import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminRefresh from "./AdminRefresh";
import AdminBell from "./AdminBell";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Tag,
  CreditCard,
  BarChart2,
  LogOut,
  Gift,
} from "lucide-react";
// No BottomNav in admin — uses its own built-in nav

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/insights", label: "Insights", icon: BarChart2 },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-[#f0f2f7] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0f1117] fixed top-0 left-0 h-screen z-40">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-lg tracking-tight">ProFindly</p>
            <p className="text-xs text-white/30 font-medium mt-0.5 uppercase tracking-widest">Admin</p>
          </div>
          <AdminBell />
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Icon size={16} className="group-hover:scale-110 transition-transform" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <form action="/auth/logout" method="POST">
            <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all w-full">
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[#0f1117] px-4 py-3">
          <p className="text-white font-black tracking-tight">ProFindly <span className="text-white/30 font-medium text-xs uppercase tracking-widest">Admin</span></p>
          <div className="flex items-center gap-2">
            <AdminBell />
            <form action="/auth/logout" method="POST">
              <button className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">
                <LogOut size={13} /> Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0f1117] border-t border-white/5 flex justify-around overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex-shrink-0 flex flex-col items-center gap-1 py-3 px-4 text-white/40 hover:text-white transition-colors min-w-[64px]"
            >
              <Icon size={18} />
              <span className="text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap">
                {label === "Subscriptions" ? "Subs" :
                  label === "Approvals" ? "Approve" :
                    label === "Categories" ? "Cats" : label}
              </span>
            </Link>
          ))}
        </nav>
          <main className="flex-1 p-4 pb-24 lg:pb-6 lg:p-8">
            <AdminRefresh />
            {children}
          </main>
      </div>
    </div>
  );
}
