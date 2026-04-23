import Link from "next/link";
import { Heart, Inbox, Sparkles } from "lucide-react";
import { TopNav } from "@/components/nav";
import { getContactRequests } from "@/lib/data";

export default async function UserDashboardPage() {
  const requests = await getContactRequests();

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <TopNav variant="dashboard" />
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <h1 className="font-display text-4xl font-bold">Dashboard</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link href="/" className="rounded-[8px] bg-white p-6">
            <Heart className="text-[#ff8a00]" />
            <h2 className="mt-5 font-display text-2xl font-bold">Favorites</h2>
            <p className="mt-2 text-sm text-[#6b7280]">No favorites yet</p>
          </Link>
          <section className="rounded-[8px] bg-white p-6">
            <Inbox className="text-[#2563eb]" />
            <h2 className="mt-5 font-display text-2xl font-bold">My Requests</h2>
            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <p key={request.id} className="rounded-[8px] bg-[#f3f5f9] p-3 text-sm">
                  {request.providerName}: {request.status}
                </p>
              ))}
            </div>
          </section>
          <section className="rounded-[8px] bg-white/60 p-6 text-[#9ca3af]">
            <Sparkles />
            <h2 className="mt-5 font-display text-2xl font-bold">Suggestions</h2>
            <p className="mt-2 text-sm">Personalized matches appear here as usage grows.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
