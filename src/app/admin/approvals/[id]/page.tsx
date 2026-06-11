import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/data";
import { updateProviderStatus, approvePendingMedia } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ArrowLeft, CheckCircle, XCircle, Mail, Phone, MapPin, Tag } from "lucide-react";

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const provider = await getProvider(id);
  if (!provider) return <div className="p-8 text-sm text-[#9ca3af]">Provider not found</div>;

  const { data: raw } = await supabase!
    .from("providers")
    .select("pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug, id_document_url")
    .eq("id", Number(id))
    .maybeSingle();

  let signedIdUrl: string | undefined;
  if (raw?.id_document_url) {
    const path = raw.id_document_url.split("/provider-ids/")[1];
    const service = createSupabaseServiceClient();
    const { data: signed } = await service.storage.from("provider-ids").createSignedUrl(path, 3600);
    signedIdUrl = signed?.signedUrl ?? undefined;
  }

  const hasPending = raw && (raw.pending_profile_photo_url || raw.pending_video_url || raw.pending_category_slug || raw.pending_portfolio_photo_urls?.length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/approvals"
          className="size-10 rounded-full bg-white border border-black/[0.06] flex items-center justify-center hover:bg-[#f0f2f7] transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-[#0f1117]">{provider.fullName}</h1>
          <p className="text-xs text-[#9ca3af]">Provider Review</p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${provider.suspended ? "bg-red-100 text-red-700" :
            provider.approved ? "bg-green-100 text-green-700" :
              "bg-amber-100 text-amber-700"
          }`}>
          {provider.suspended ? "Suspended" : provider.approved ? "Approved" : "Pending"}
        </span>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
        <div className="flex items-center gap-4">
          {provider.profilePhotoUrl ? (
            <Image src={provider.profilePhotoUrl} alt="" width={64} height={64} className="size-16 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="size-16 rounded-2xl bg-[#f0f2f7] flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-[#9ca3af]">{provider.fullName.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-black text-[#0f1117]">{provider.fullName}</p>
            {provider.businessName && <p className="text-sm text-[#6b7280]">{provider.businessName}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {[
            { icon: Tag, value: provider.categoryName },
            { icon: MapPin, value: provider.location },
            { icon: Mail, value: provider.email },
            { icon: Phone, value: provider.phone },
          ].map(({ icon: Icon, value }) => value ? (
            <div key={value} className="flex items-center gap-2.5 text-sm text-[#6b7280]">
              <Icon size={14} className="text-[#c4c9d4] shrink-0" />
              <span className="truncate">{value}</span>
            </div>
          ) : null)}
        </div>
        {provider.bio && (
          <p className="mt-4 text-sm text-[#6b7280] leading-relaxed border-t border-black/[0.04] pt-4">{provider.bio}</p>
        )}
        {provider.oneLine && (
          <p className="mt-2 text-sm font-medium text-[#0f1117] italic">"{provider.oneLine}"</p>
        )}
      </div>

      {/* ID Document */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
        <h2 className="font-black text-[#0f1117] mb-3">ID / License</h2>
        {signedIdUrl ? (
          raw?.id_document_url?.endsWith(".pdf") ? (
            <a href={signedIdUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 hover:bg-[#f0f2f7] transition-colors">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-bold text-[#0f1117]">View ID Document</p>
                <p className="text-xs text-[#9ca3af]">Opens PDF</p>
              </div>
            </a>
          ) : (
            <a href={signedIdUrl} target="_blank" rel="noopener noreferrer">
              <Image src={signedIdUrl} alt="ID" width={400} height={250} className="rounded-xl w-full max-w-sm object-cover border border-black/10" />
            </a>
          )
        ) : (
          <p className="text-sm text-[#c4c9d4]">No ID uploaded yet</p>
        )}
      </div>

      {/* Pending Changes */}
      {hasPending && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04] space-y-5">
          <h2 className="font-black text-[#0f1117]">Pending Changes</h2>

          {raw.pending_profile_photo_url && (
            <div>
              <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">New Profile Photo</p>
              <Image src={raw.pending_profile_photo_url} alt="" width={80} height={80} className="size-20 rounded-2xl object-cover" />
              <div className="mt-3 flex gap-2">
                <ApprovePendingButton providerId={id} field="profile_photo" label="Approve" />
                <RejectPendingButton providerId={id} field="profile_photo" label="Reject" />
              </div>
            </div>
          )}

          {raw.pending_category_slug && (
            <div className="border-t border-black/[0.04] pt-5">
              <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">New Category</p>
              <p className="font-bold text-[#0f1117]">{raw.pending_category_slug}</p>
              <div className="mt-3 flex gap-2">
                <ApprovePendingButton providerId={id} field="category" label="Approve" />
                <RejectPendingButton providerId={id} field="category" label="Reject" />
              </div>
            </div>
          )}

          {raw.pending_video_url && (
            <div className="border-t border-black/[0.04] pt-5">
              <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">New Video</p>
              <a href={raw.pending_video_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-[#2563eb] break-all hover:underline">{raw.pending_video_url}</a>
              <div className="mt-3 flex gap-2">
                <ApprovePendingButton providerId={id} field="video" label="Approve" />
                <RejectPendingButton providerId={id} field="video" label="Reject" />
              </div>
            </div>
          )}

          {raw.pending_portfolio_photo_urls?.length > 0 && (
            <div className="border-t border-black/[0.04] pt-5">
              <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2">New Portfolio ({raw.pending_portfolio_photo_urls.length} photos)</p>
              <p className="text-xs text-[#9ca3af] mb-3">Remove photos you don't want to approve, then click Approve All.</p>
              <div className="grid grid-cols-3 gap-2">
                {raw.pending_portfolio_photo_urls.map((url: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f0f2f7]">
                    <Image src={url} alt="" width={150} height={150} className="w-full h-full object-cover" />
                    <form action="/api/admin/remove-pending-portfolio-photo" method="POST" className="absolute top-1 right-1">
                      <input type="hidden" name="providerId" value={id} />
                      <input type="hidden" name="photoUrl" value={url} />
                      <button className="size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition text-xs font-bold">✕</button>
                    </form>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <ApprovePendingButton providerId={id} field="portfolio" label="Approve All" />
                <RejectPendingButton providerId={id} field="portfolio" label="Reject All" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
        <h2 className="font-black text-[#0f1117] mb-4">Account Actions</h2>
        <div className="flex flex-wrap gap-2">
          {!provider.approved && (
            <form action={updateProviderStatus}>
              <input type="hidden" name="providerId" value={provider.id} />
              <input type="hidden" name="status" value="approved" />
              <button className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white active:scale-95 transition-all">
                <CheckCircle size={15} /> Approve Account
              </button>
            </form>
          )}
          {provider.approved && !provider.suspended && (
            <form action={updateProviderStatus}>
              <input type="hidden" name="providerId" value={id} />
              <input type="hidden" name="status" value="suspended" />
              <button className="flex items-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-bold text-red-500 active:scale-95 transition-all">
                <XCircle size={15} /> Suspend
              </button>
            </form>
          )}
          {provider.suspended && (
            <form action={updateProviderStatus}>
              <input type="hidden" name="providerId" value={id} />
              <input type="hidden" name="status" value="approved" />
              <button className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white active:scale-95 transition-all">
                <CheckCircle size={15} /> Unsuspend
              </button>
            </form>
          )}
          {!provider.approved && (
            <form action={updateProviderStatus}>
              <input type="hidden" name="providerId" value={id} />
              <input type="hidden" name="status" value="suspended" />
              <button className="flex items-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-bold text-red-500 active:scale-95 transition-all">
                <XCircle size={15} /> Reject
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovePendingButton({ providerId, field, label }: { providerId: string; field: string; label: string }) {
  return (
    <form action={approvePendingMedia}>
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="field" value={field} />
      <button className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition-all">
        <CheckCircle size={12} /> {label}
      </button>
    </form>
  );
}

function RejectPendingButton({ providerId, field, label }: { providerId: string; field: string; label: string }) {
  return (
    <form action="/api/admin/reject-media" method="POST">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="field" value={field} />
      <button className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 active:scale-95 transition-all">
        <XCircle size={12} /> {label}
      </button>
    </form>
  );
}
