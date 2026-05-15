import { getProviderRequests, getCurrentProviderProfile } from "@/lib/data";
import { markRequestContacted } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MessageSquare, Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default async function ProviderRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const provider = await getCurrentProviderProfile();
  if (!provider) redirect("/provider/setup");

  const requests = await getProviderRequests();
  const newRequests = requests.filter((r) => r.status === "new");
  const contactedRequests = requests.filter((r) => r.status === "contacted");
  const activeTab = params.tab === "contacted" ? "contacted" : "new";
  const highlightId = params.id;

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-3xl px-4 pb-14 pt-6 sm:px-6">

        <div className="flex items-center gap-3 mb-6">
          <Link href="/provider/dashboard" className="size-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center hover:bg-[#f0f2f7] transition shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-black text-[#0f1117]">Contact Requests</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Link href="/provider/requests?tab=new"
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === "new" ? "bg-[#0f1117] text-white" : "bg-white text-[#6b7280] hover:bg-[#f3f5f9]"}`}>
            New
            {newRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{newRequests.length}</span>
            )}
          </Link>
          <Link href="/provider/requests?tab=contacted"
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === "contacted" ? "bg-[#0f1117] text-white" : "bg-white text-[#6b7280] hover:bg-[#f3f5f9]"}`}>
            Contacted
            {contactedRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-[#6b7280] px-1.5 py-0.5 text-[10px] font-bold text-white">{contactedRequests.length}</span>
            )}
          </Link>
        </div>

        {/* Request list */}
        <div className="space-y-3">
          {(activeTab === "new" ? newRequests : contactedRequests).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-black/[0.04]">
              <p className="text-sm text-[#9ca3af]">{activeTab === "new" ? "No new requests." : "No contacted requests yet."}</p>
            </div>
          ) : (
            (activeTab === "new" ? newRequests : contactedRequests).map((request) => (
              <article
                key={request.id}
                id={`request-${request.id}`}
                className={`rounded-2xl border bg-white overflow-hidden transition ${
                  highlightId === request.id ? "border-[#2563eb] shadow-md" : "border-black/[0.04] shadow-sm"
                }`}
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-black/[0.04] flex items-center justify-between">
                  <div>
                    <p className="font-black text-[#0f1117]">{request.clientName}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">
                      {new Date(request.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {activeTab === "new" && (
                    <form action={markRequestContacted}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button className="rounded-full border border-black/10 bg-[#f3f5f9] px-4 py-2 text-xs font-bold text-[#0f1117] hover:bg-[#e5e7eb] transition">
                        Mark Contacted
                      </button>
                    </form>
                  )}
                </div>

                {/* Contact details */}
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={14} className="text-[#9ca3af] shrink-0" />
                      <p className="text-xs text-[#6b7280] shrink-0">Email</p>
                      <p className="text-sm font-medium text-[#0f1117] truncate">{request.clientEmail}</p>
                    </div>
                    <CopyButton value={request.clientEmail} />
                  </div>

                  {request.phone && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone size={14} className="text-[#9ca3af] shrink-0" />
                        <p className="text-xs text-[#6b7280] shrink-0">Phone</p>
                        <p className="text-sm font-medium text-[#0f1117] truncate">{request.phone}</p>
                      </div>
                      <CopyButton value={request.phone} />
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-[#9ca3af] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#6b7280] mb-1">Message</p>
                      <p className="text-sm text-[#374151] leading-relaxed">{request.message}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}