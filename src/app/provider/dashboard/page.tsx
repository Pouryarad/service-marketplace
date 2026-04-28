import Link from "next/link";
import { BarChart3, CheckCircle2, Inbox, Timer } from "lucide-react";
import { TopNav } from "@/components/nav";
import { markRequestContacted, subscribeProvider } from "@/lib/actions";
import { getContactRequests, getProviders } from "@/lib/data";


export default async function ProviderDashboardPage() {
  const [providers, requests] = await Promise.all([
    getProviders({ includeHidden: true }),
    getContactRequests(),
  ]);
  const provider = providers[0];
  const openRequests = requests.filter((request) => request.status === "new");

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Provider Dashboard</h1>
            <p className="mt-2 text-[#6b7280]">Manage leads, visibility, and subscription status.</p>
          </div>
          <form action={subscribeProvider}>
            <button className="rounded-full bg-[#ff8a00] px-5 py-3 font-bold text-white">
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section className="rounded-[8px] bg-white p-6">
            <BarChart3 className="text-[#2563eb]" />
            <h2 className="mt-5 font-display text-2xl font-bold">Insights</h2>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Metric label="Day" value={provider?.clicksDay ?? 0} />
              <Metric label="Week" value={provider?.clicksWeek ?? 0} />
              <Metric label="Month" value={provider?.clicksMonth ?? 0} />
            </div>
          </section>
          <section className="rounded-[8px] bg-white p-6">
            <Timer className="text-[#ff8a00]" />
            <h2 className="mt-5 font-display text-2xl font-bold">Profile Status</h2>
            <p className="mt-4 inline-flex rounded-full bg-[#f3f5f9] px-3 py-2 text-sm font-bold capitalize">
              {provider?.status ?? "draft"}
            </p>
            <p className="mt-3 text-sm text-[#6b7280]">
              Visible only when approved, active, subscribed, and not suspended.
            </p>
          </section>
          <Link href="/provider/setup" className="rounded-[8px] bg-white p-6">
            <CheckCircle2 className="text-[#22c55e]" />
            <h2 className="mt-5 font-display text-2xl font-bold">Edit Profile</h2>
            <p className="mt-2 text-sm text-[#6b7280]">Update business details and photos.</p>
          </Link>
        </div>

        <section className="mt-6 rounded-[8px] bg-white p-6">
          <div className="flex items-center gap-2">
            <Inbox className="text-[#2563eb]" />
            <h2 className="font-display text-2xl font-bold">Contact Requests</h2>
          </div>
          <div className="mt-5 space-y-3">
            {requests.map((request) => (
              <article key={request.id} className="rounded-[8px] border border-black/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold">{request.clientName}</p>
                    <p className="text-sm text-[#6b7280]">{request.clientEmail} {request.phone ? `· ${request.phone}` : ""}</p>
                    <p className="mt-2 text-sm">{request.message}</p>
                  </div>
                  <form action={markRequestContacted}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <button className="rounded-full border border-black/10 px-4 py-2 text-sm font-bold">
                      Mark as contacted
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] bg-[#f3f5f9] p-3">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold text-[#6b7280]">{label}</p>
    </div>
  );
}
