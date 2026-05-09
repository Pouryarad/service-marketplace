import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { updateProviderStatus } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";

export default async function AdminApprovalsPage() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });
  const pendingProviders = providers.filter((p) => !p.approved && !p.suspended);
  const suspendedProviders = providers.filter((p) => p.suspended);

  const { data: rawPendingMedia } = await supabase!
  .from("providers")
  .select("id, full_name, pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug")
  .or("pending_profile_photo_url.not.is.null,pending_video_url.not.is.null,pending_category_slug.not.is.null,pending_portfolio_photo_urls.not.is.null");

const pendingMedia = (rawPendingMedia ?? []).filter((p) =>
  p.pending_profile_photo_url ||
  p.pending_video_url ||
  p.pending_category_slug ||
  (Array.isArray(p.pending_portfolio_photo_urls) && p.pending_portfolio_photo_urls.length > 0)
);
  const totalPending = pendingProviders.length + (pendingMedia?.length ?? 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0f1117]">Approvals</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">Review providers and media changes</p>
        </div>
        {totalPending > 0 && (
          <div className="size-8 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-xs font-black text-white">{totalPending}</span>
          </div>
        )}
      </div>

      {/* Account Approvals */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-black text-[#0f1117]">Account Approvals</h2>
          {pendingProviders.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{pendingProviders.length}</span>
          )}
        </div>

        {pendingProviders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-black/[0.04]">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm text-[#9ca3af] font-medium">All caught up</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingProviders.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04]">
                <div className="flex items-center gap-3">
                  {p.profilePhotoUrl ? (
                    <Image src={p.profilePhotoUrl} alt={p.fullName} width={44} height={44} className="size-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="size-11 rounded-full bg-[#f0f2f7] flex items-center justify-center shrink-0">
                      <span className="font-bold text-[#6b7280]">{p.fullName.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0f1117] truncate">{p.fullName}</p>
                    <p className="text-xs text-[#9ca3af] truncate">{p.categoryName} · {p.location}</p>
                    <p className="text-xs text-[#9ca3af] truncate">{p.email}</p>
                  </div>
                  <Link href={`/admin/approvals/${p.id}`} className="shrink-0 text-[#9ca3af] hover:text-[#0f1117] transition-colors">
                    <ChevronRight size={18} />
                  </Link>
                </div>

                {p.bio && (
                  <p className="mt-3 text-xs text-[#9ca3af] line-clamp-2 border-t border-black/[0.04] pt-3">{p.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/[0.04]">
                  <Link href={`/admin/approvals/${p.id}`}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-[#6b7280] active:scale-95 transition-all">
                    View Details
                  </Link>
                  <form action={updateProviderStatus}>
                    <input type="hidden" name="providerId" value={p.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition-all">
                      <CheckCircle size={12} /> Approve
                    </button>
                  </form>
                  <form action={updateProviderStatus}>
                    <input type="hidden" name="providerId" value={p.id} />
                    <input type="hidden" name="status" value="suspended" />
                    <button className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 active:scale-95 transition-all">
                      <XCircle size={12} /> Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Media */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-black text-[#0f1117]">Media & Category Changes</h2>
          {(pendingMedia?.length ?? 0) > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{pendingMedia?.length}</span>
          )}
        </div>

        {!pendingMedia || pendingMedia.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-black/[0.04]">
            <p className="text-2xl mb-1">✨</p>
            <p className="text-sm text-[#9ca3af] font-medium">No pending media</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingMedia.map((p) => (
              <Link key={p.id} href={`/admin/approvals/${p.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04] active:scale-[0.99] transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0f1117] truncate">{p.full_name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.pending_profile_photo_url && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">📸 Photo</span>}
                    {p.pending_video_url && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">🎥 Video</span>}
                    {p.pending_category_slug && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">🏷 {p.pending_category_slug}</span>}
                    {p.pending_portfolio_photo_urls?.length > 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">🖼 {p.pending_portfolio_photo_urls.length} photos</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#9ca3af] shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Suspended */}
      {suspendedProviders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-black text-[#0f1117]">Suspended</h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{suspendedProviders.length}</span>
          </div>
          <div className="space-y-2">
            {suspendedProviders.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-black/[0.04]">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0f1117] truncate">{p.fullName}</p>
                  <p className="text-xs text-[#9ca3af] truncate">{p.categoryName} · {p.location}</p>
                </div>
                <form action={updateProviderStatus}>
                  <input type="hidden" name="providerId" value={p.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition-all shrink-0">
                    Unsuspend
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
