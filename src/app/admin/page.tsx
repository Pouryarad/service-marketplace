import type { ReactNode } from "react";
import { Bell, DollarSign, EyeOff, Images, ShieldCheck, Users } from "lucide-react";
import { TopNav } from "@/components/nav";
import { updateProviderStatus } from "@/lib/actions";
import { getCategories, getContactRequests, getProviders } from "@/lib/data";

export default async function AdminPage() {
  const [providers, requests, categories] = await Promise.all([
    getProviders({ includeHidden: true }),
    getContactRequests(),
    getCategories(),
  ]);
  const pendingProviders = providers.filter((provider) => provider.status === "pending");

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <TopNav variant="admin" />
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">Admin Panel</h1>
            <p className="mt-2 text-[#6b7280]">Moderation, pricing, featured placements, and analytics.</p>
          </div>
          <div className="relative grid size-11 place-items-center rounded-full bg-white">
            <Bell size={19} />
            {pendingProviders.length > 0 && <span className="absolute right-2 top-2 size-2.5 rounded-full bg-red-500" />}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat icon={<Users />} label="Total users" value="Demo" />
          <Stat icon={<ShieldCheck />} label="Providers" value={providers.length} />
          <Stat icon={<Bell />} label="Requests" value={requests.length} />
          <Stat icon={<Images />} label="Categories" value={categories.length} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[8px] bg-white p-6">
            <h2 className="font-display text-2xl font-bold">Providers</h2>
            <div className="mt-5 space-y-3">
              {providers.map((provider) => (
                <article key={provider.id} className="rounded-[8px] border border-black/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold">{provider.fullName}</p>
                      <p className="text-sm text-[#6b7280]">
                        {provider.categoryName} · {provider.status} · subscription {provider.subscriptionStatus}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AdminStatusButton providerId={provider.id} status="approved" label="Approve" />
                      <AdminStatusButton providerId={provider.id} status="pending" label="Reject" />
                      <AdminStatusButton providerId={provider.id} status="suspended" label="Suspend" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <Panel icon={<EyeOff />} title="Listings" text="Hide/show listings through provider status." />
            <Panel icon={<Images />} title="Photos" text="Approve/reject uploads through storage metadata." />
            <Panel icon={<DollarSign />} title="Pricing" text="Subscription: $49/mo. Featured: future fixed monthly pricing." />
            <Panel icon={<ShieldCheck />} title="Featured" text="Manually assign top 3 per category." />
          </aside>
        </div>
      </section>
    </main>
  );
}

function AdminStatusButton({
  providerId,
  status,
  label,
}: {
  providerId: string;
  status: string;
  label: string;
}) {
  return (
    <form action={updateProviderStatus}>
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-full border border-black/10 px-3 py-2 text-sm font-bold">
        {label}
      </button>
    </form>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <section className="rounded-[8px] bg-white p-5">
      <div className="text-[#2563eb]">{icon}</div>
      <p className="mt-4 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm font-semibold text-[#6b7280]">{label}</p>
    </section>
  );
}

function Panel({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <section className="rounded-[8px] bg-white p-5">
      <div className="text-[#ff8a00]">{icon}</div>
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{text}</p>
    </section>
  );
}
