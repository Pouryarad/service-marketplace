import { getProviderRequests, getCurrentProviderProfile } from "@/lib/data";
import { markRequestContacted } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

        <div className="flex items-center gap-3">
          <Link
            href="/provider/dashboard"
            className="grid size-9 place-items-center rounded-full hover:bg-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Contact Requests</h1>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <Link
            href="/provider/requests?tab=new"
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === "new"
                ? "bg-[#1f1f1f] text-white"
                : "bg-white text-[#6b7280] hover:bg-[#f3f5f9]"
            }`}
          >
            New
            {newRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {newRequests.length}
              </span>
            )}
          </Link>
          <Link
            href="/provider/requests?tab=contacted"
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === "contacted"
                ? "bg-[#1f1f1f] text-white"
                : "bg-white text-[#6b7280] hover:bg-[#f3f5f9]"
            }`}
          >
            Contacted
            {contactedRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-[#6b7280] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {contactedRequests.length}
              </span>
            )}
          </Link>
        </div>

        {/* Request list */}
        <div className="mt-4 space-y-3">
          {(activeTab === "new" ? newRequests : contactedRequests).length === 0 ? (
            <p className="text-sm text-[#6b7280]">
              {activeTab === "new" ? "No new requests." : "No contacted requests yet."}
            </p>
          ) : (
            (activeTab === "new" ? newRequests : contactedRequests).map((request) => (
              <article
                key={request.id}
                id={`request-${request.id}`}
                className={`rounded-2xl border p-5 transition ${
                  highlightId === request.id
                    ? "border-[#2563eb] bg-[#eff6ff] shadow-md"
                    : activeTab === "new"
                      ? "border-[#2563eb]/20 bg-white"
                      : "border-black/10 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-[#1f1f1f]">{request.clientName}</p>
                    <p className="mt-0.5 text-sm text-[#6b7280]">
                      {request.clientEmail}
                      {request.phone ? ` · ${request.phone}` : ""}
                    </p>
                    <p className="mt-3 text-sm text-[#1f1f1f]">{request.message}</p>
                    <p className="mt-2 text-xs text-[#9ca3af]">
                      {new Date(request.created_at).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {activeTab === "new" && (
                    <form action={markRequestContacted}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button className="whitespace-nowrap rounded-full border border-black/10 bg-[#f3f5f9] px-4 py-2 text-sm font-bold text-[#1f1f1f] transition hover:bg-[#e5e7eb]">
                        Mark contacted
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}