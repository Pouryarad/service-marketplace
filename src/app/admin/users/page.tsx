import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { updateProviderStatus } from "@/lib/actions";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab, q } = await searchParams;
  const activeTab = tab === "providers" ? "providers" : "clients";

  const supabase = await createSupabaseServerClient();

  const [providers, clientsRes] = await Promise.all([
    getProviders({ includeHidden: true }),
    supabase!
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("role", "client")
      .order("created_at", { ascending: false }),
  ]);

  const clients = clientsRes.data ?? [];

  const filteredProviders = q
    ? providers.filter((p) =>
        p.fullName.toLowerCase().includes(q.toLowerCase()) ||
        p.email.toLowerCase().includes(q.toLowerCase())
      )
    : providers;

  const filteredClients = q
    ? clients.filter((c) =>
        c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        c.email?.toLowerCase().includes(q.toLowerCase())
      )
    : clients;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1f1f1f] sm:text-2xl">Users</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Manage all clients and providers.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm w-fit">
        <Link
          href="/admin/users?tab=clients"
          className={`px-5 py-2 rounded-full text-sm font-bold transition ${
            activeTab === "clients" ? "bg-[#2563eb] text-white" : "text-[#6b7280] hover:text-[#1f1f1f]"
          }`}
        >
          Clients ({clients.length})
        </Link>
        <Link
          href="/admin/users?tab=providers"
          className={`px-5 py-2 rounded-full text-sm font-bold transition ${
            activeTab === "providers" ? "bg-[#2563eb] text-white" : "text-[#6b7280] hover:text-[#1f1f1f]"
          }`}
        >
          Providers ({providers.length})
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <form>
          <input type="hidden" name="tab" value={activeTab} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={`Search ${activeTab}...`}
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#2563eb] transition"
          />
        </form>
      </div>

      {/* Clients Tab */}
      {activeTab === "clients" && (
        <div className="rounded-2xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="border-b border-black/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af] hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af] hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#f3f5f9] transition">
                  <td className="px-4 py-3 font-medium text-[#1f1f1f]">{client.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#6b7280] hidden sm:table-cell">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[#6b7280] hidden md:table-cell">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === "providers" && (
        <div className="space-y-3">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#1f1f1f]">{provider.fullName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      provider.suspended ? "bg-red-100 text-red-700" :
                      provider.approved ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {provider.suspended ? "Suspended" : provider.approved ? "Active" : "Pending"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      provider.subscriptionStatus === "active" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {provider.subscriptionStatus ?? "No sub"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {provider.categoryName} · {provider.location} · {provider.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!provider.approved && !provider.suspended && (
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 transition">
                        Approve
                      </button>
                    </form>
                  )}
                  {!provider.suspended ? (
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input type="hidden" name="status" value="suspended" />
                      <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                        Suspend
                      </button>
                    </form>
                  ) : (
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded-full border border-green-200 px-3 py-1.5 text-xs font-bold text-green-500 hover:bg-green-50 transition">
                        Unsuspend
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}