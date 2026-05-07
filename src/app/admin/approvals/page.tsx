import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { updateProviderStatus } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export default async function AdminApprovalsPage() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });

  const pendingProviders = providers.filter((p) => !p.approved && !p.suspended);

  // Pending media approvals
  const { data: pendingMedia } = await supabase!
    .from("providers")
    .select("id, full_name, pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug")
    .or("pending_profile_photo_url.not.is.null,pending_video_url.not.is.null,pending_category_slug.not.is.null");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#1f1f1f] sm:text-2xl">Approvals</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Review and approve provider accounts and media.</p>
      </div>

      {/* Account Approvals */}
      <section>
        <h2 className="text-base font-bold text-[#1f1f1f] mb-3">
          Account Approvals
          <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
            {pendingProviders.length}
          </span>
        </h2>

        {pendingProviders.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#9ca3af] shadow-sm">
            No pending account approvals 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProviders.map((provider) => (
              <div key={provider.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    {provider.profilePhotoUrl && (
                      <Image
                        src={provider.profilePhotoUrl}
                        alt={provider.fullName}
                        width={48}
                        height={48}
                        className="size-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-[#1f1f1f]">{provider.fullName}</p>
                      <p className="text-xs text-[#6b7280]">{provider.categoryName} · {provider.location}</p>
                      <p className="text-xs text-[#6b7280]">{provider.email} · {provider.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* View ID */}
                    <Link
                      href={`/admin/approvals/${provider.id}`}
                      className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
                    >
                      View Details
                    </Link>

                    {/* Approve */}
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 transition">
                        <CheckCircle size={12} /> Approve
                      </button>
                    </form>

                    {/* Reject */}
                    <form action={updateProviderStatus}>
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input type="hidden" name="status" value="suspended" />
                      <button className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                        <XCircle size={12} /> Reject
                      </button>
                    </form>
                  </div>
                </div>

                {/* Bio preview */}
                {provider.bio && (
                  <p className="mt-3 text-xs text-[#6b7280] line-clamp-2 border-t border-black/5 pt-3">
                    {provider.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Suspended Providers */}
      <section>
        <h2 className="text-base font-bold text-[#1f1f1f] mb-3">
          Suspended
          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
            {providers.filter((p) => p.suspended).length}
          </span>
        </h2>

        {providers.filter((p) => p.suspended).length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#9ca3af] shadow-sm">
            No suspended providers 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {providers.filter((p) => p.suspended).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div>
                  <p className="font-bold text-sm text-[#1f1f1f]">{provider.fullName}</p>
                  <p className="text-xs text-[#6b7280]">{provider.categoryName} · {provider.location}</p>
                </div>
                <form action={updateProviderStatus}>
                  <input type="hidden" name="providerId" value={provider.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 transition">
                    Unsuspend
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Media Approvals */}
      <section>
        <h2 className="text-base font-bold text-[#1f1f1f] mb-3">
          Pending Media / Category Changes
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
            {pendingMedia?.length ?? 0}
          </span>
        </h2>

        {!pendingMedia || pendingMedia.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#9ca3af] shadow-sm">
            No pending media changes 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMedia.map((provider) => (
              <div key={provider.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-[#1f1f1f]">{provider.full_name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {provider.pending_profile_photo_url && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">📸 Photo</span>
                      )}
                      {provider.pending_video_url && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">🎥 Video</span>
                      )}
                      {provider.pending_category_slug && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">🏷 Category: {provider.pending_category_slug}</span>
                      )}
                      {provider.pending_portfolio_photo_urls?.length > 0 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">🖼 Portfolio ({provider.pending_portfolio_photo_urls.length})</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/approvals/${provider.id}`}
                    className="rounded-full bg-[#2563eb] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}