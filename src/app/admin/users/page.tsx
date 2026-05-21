import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { updateProviderStatus } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { Search, ExternalLink, CheckCircle, XCircle, UserCheck } from "lucide-react";


export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab, q } = await searchParams;
  const activeTab = tab === "providers" ? "providers" : "clients";

  const supabase = await createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const [providers, clientsRes] = await Promise.all([
    getProviders({ includeHidden: true }),
    service.from("profiles").select("id, full_name, email, phone, city, created_at").eq("role", "client").order("created_at", { ascending: false }),
  ]);
  const clients = clientsRes.data ?? [];

  const filteredProviders = q
    ? providers.filter((p) => p.fullName.toLowerCase().includes(q.toLowerCase()) || p.email.toLowerCase().includes(q.toLowerCase()))
    : providers;

  const filteredClients = q
    ? clients.filter((c) => c.full_name?.toLowerCase().includes(q.toLowerCase()) || c.email?.toLowerCase().includes(q.toLowerCase()))
    : clients;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0f1117]">Users</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">Manage clients and providers</p>
        </div>
        <a href={`/api/admin/export?type=${activeTab === "providers" ? "providers" : "clients"}`}
          className="flex items-center gap-1.5 rounded-full bg-[#0f1117] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a1a2e] transition">
          ↓ Export CSV
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-black/[0.04] w-fit">
        <Link href="/admin/users?tab=clients"
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "clients" ? "bg-[#0f1117] text-white shadow-sm" : "text-[#9ca3af] hover:text-[#0f1117]"}`}>
          Clients <span className="ml-1 opacity-60">({clients.length})</span>
        </Link>
        <Link href="/admin/users?tab=providers"
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "providers" ? "bg-[#0f1117] text-white shadow-sm" : "text-[#9ca3af] hover:text-[#0f1117]"}`}>
          Providers <span className="ml-1 opacity-60">({providers.length})</span>
        </Link>
      </div>

      {/* Search */}
      <form className="relative">
        <input type="hidden" name="tab" value={activeTab} />
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input name="q" defaultValue={q ?? ""} placeholder={`Search ${activeTab}...`}
          className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0f1117] transition placeholder:text-[#c4c9d4]" />
      </form>

      {/* Clients */}
      {activeTab === "clients" && (
        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.04] overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#9ca3af]">No clients found</div>
          ) : (
            filteredClients.map((client, i) => (
              <div key={client.id} className={`flex items-center gap-3 px-4 py-3 ${i < filteredClients.length - 1 ? "border-b border-black/[0.04]" : ""}`}>
                <div className="size-9 rounded-full bg-[#f0f2f7] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#6b7280]">{(client.full_name ?? client.email ?? "?").charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0f1117] truncate">{client.full_name ?? "—"}</p>
                  <p className="text-xs text-[#9ca3af] truncate">{client.email ?? "—"}</p>
                </div>
                <p className="text-xs text-[#c4c9d4] shrink-0">{new Date(client.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Providers */}
      {activeTab === "providers" && (
        <div className="space-y-2">
          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-2xl py-16 text-center text-sm text-[#9ca3af]">No providers found</div>
          ) : (
            filteredProviders.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full overflow-hidden bg-[#f0f2f7] flex items-center justify-center shrink-0 mt-0.5">
                    {p.profilePhotoUrl ? (
                      <Image src={p.profilePhotoUrl} alt={p.fullName} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[#6b7280]">{p.fullName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#0f1117] text-sm">{p.fullName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.suspended ? "bg-red-100 text-red-700" :
                        p.approved ? "bg-green-100 text-green-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                        {p.suspended ? "Suspended" : p.approved ? "Approved" : "Pending"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.subscriptionStatus === "active" ? "bg-blue-100 text-blue-700" : "bg-[#f0f2f7] text-[#9ca3af]"
                        }`}>
                        {p.subscriptionStatus ?? "No sub"}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-1 truncate">{p.categoryName} · {p.location}</p>
                    <p className="text-xs text-[#9ca3af] truncate">{p.email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/[0.04]">
                  {!p.approved && !p.suspended && (
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={p.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition-all">
                        <CheckCircle size={12} /> Approve
                      </button>
                    </form>
                  )}
                  {!p.suspended ? (
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={p.id} />
                      <input type="hidden" name="status" value="suspended" />
                      <button className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 active:scale-95 transition-all">
                        <XCircle size={12} /> Suspend
                      </button>
                    </form>
                  ) : (
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={p.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="flex items-center gap-1.5 rounded-full border border-green-200 px-3 py-1.5 text-xs font-bold text-green-600 active:scale-95 transition-all">
                        <UserCheck size={12} /> Unsuspend
                      </button>
                    </form>
                  )}
                  <Link href={`/providers/${p.slug ?? p.id}`} target="_blank"
                    className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-[#6b7280] active:scale-95 transition-all">
                    <ExternalLink size={12} /> Profile
                  </Link>
                  <Link href={`/api/impersonate?id=${p.id}`} className="flex items-center gap-1.5 rounded-full border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-500 active:scale-95 transition-all">
                    Impersonate
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
