import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/data";
import { updateProviderStatus } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const provider = await getProvider(id);
  if (!provider) return <div>Provider not found</div>;

  // Get raw DB data for pending fields and ID document
  const { data: raw } = await supabase!
    .from("providers")
    .select("pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug, id_document_url")
    .eq("id", Number(id))
    .maybeSingle();

  let signedIdUrl: string | undefined = undefined;
  if (raw?.id_document_url) {
    const path = raw.id_document_url.split("/provider-ids/")[1];
    const { data: signed } = await supabase!.storage
      .from("provider-ids")
      .createSignedUrl(path, 3600);
    signedIdUrl = signed?.signedUrl ?? undefined;
  }

  if (!raw) return <div>Provider data not found</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/approvals" className="grid size-9 place-items-center rounded-full bg-white shadow-sm hover:bg-[#f3f5f9] transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1f1f1f]">{provider.fullName}</h1>
          <p className="text-sm text-[#6b7280]">Provider Review</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-bold text-[#1f1f1f]">Profile Info</h2>
        <div className="flex items-center gap-3">
          {provider.profilePhotoUrl && (
            <Image src={provider.profilePhotoUrl} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
          )}
          <div>
            <p className="font-bold">{provider.fullName}</p>
            <p className="text-sm text-[#6b7280]">{provider.categoryName} · {provider.location}</p>
            <p className="text-sm text-[#6b7280]">{provider.email} · {provider.phone}</p>
          </div>
        </div>
        {provider.bio && <p className="text-sm text-[#6b7280] border-t border-black/5 pt-3">{provider.bio}</p>}
      </div>

      {/* ID Document */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold text-[#1f1f1f] mb-3">ID / License</h2>
        {signedIdUrl ? (
          <div>
            {raw.id_document_url.endsWith(".pdf") ? (
              <a href={signedIdUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 hover:bg-[#f3f5f9] transition w-fit">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-bold text-[#1f1f1f]">View ID Document</p>
                  <p className="text-xs text-[#6b7280]">Click to open PDF</p>
                </div>
              </a>
            ) : (
              <a href={signedIdUrl} target="_blank" rel="noopener noreferrer">
                <Image src={signedIdUrl!} alt="ID Document" width={400} height={250} className="rounded-xl w-full max-w-sm object-cover border border-black/10" />
              </a>
            )}
          </div>
      ) : (
      <p className="text-sm text-[#9ca3af]">No ID uploaded yet.</p>
        )}
    </div>

      {/* Pending Media */ }
  {
    (raw?.pending_profile_photo_url || raw?.pending_video_url || raw?.pending_category_slug || raw?.pending_portfolio_photo_urls?.length > 0) && (
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-[#1f1f1f]">Pending Changes</h2>

        {raw?.pending_profile_photo_url && (
          <div>
            <p className="text-xs font-bold text-[#6b7280] mb-2">NEW PROFILE PHOTO</p>
            <Image src={raw.pending_profile_photo_url} alt="" width={80} height={80} className="size-20 rounded-full object-cover" />
            <div className="mt-2 flex gap-2">
              <ApprovePendingButton providerId={id} field="profile_photo" label="Approve Photo" />
              <RejectPendingButton providerId={id} field="profile_photo" label="Reject" />
            </div>
          </div>
        )}

        {raw?.pending_category_slug && (
          <div className="border-t border-black/5 pt-4">
            <p className="text-xs font-bold text-[#6b7280] mb-1">NEW CATEGORY</p>
            <p className="font-medium">{raw.pending_category_slug}</p>
            <div className="mt-2 flex gap-2">
              <ApprovePendingButton providerId={id} field="category" label="Approve Category" />
              <RejectPendingButton providerId={id} field="category" label="Reject" />
            </div>
          </div>
        )}

        {raw?.pending_video_url && (
          <div className="border-t border-black/5 pt-4">
            <p className="text-xs font-bold text-[#6b7280] mb-2">NEW VIDEO</p>
            <a href={raw.pending_video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2563eb] underline break-all">
              {raw.pending_video_url}
            </a>
            <div className="mt-2 flex gap-2">
              <ApprovePendingButton providerId={id} field="video" label="Approve Video" />
              <RejectPendingButton providerId={id} field="video" label="Reject" />
            </div>
          </div>
        )}

        {raw?.pending_portfolio_photo_urls?.length > 0 && (
          <div className="border-t border-black/5 pt-4">
            <p className="text-xs font-bold text-[#6b7280] mb-2">NEW PORTFOLIO PHOTOS</p>
            <div className="grid grid-cols-3 gap-2">
              {raw.pending_portfolio_photo_urls.map((url: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <Image src={url} alt="" width={150} height={150} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <ApprovePendingButton providerId={id} field="portfolio" label="Approve Portfolio" />
              <RejectPendingButton providerId={id} field="portfolio" label="Reject" />
            </div>
          </div>
        )}
      </div>
    )
  }

  {/* Actions */ }
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="font-bold text-[#1f1f1f] mb-3">Account Actions</h2>
    <div className="flex flex-wrap gap-2">
      <form action={updateProviderStatus}>
        <input type="hidden" name="providerId" value={id} />
        <input type="hidden" name="status" value="approved" />
        <button className="flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 transition">
          <CheckCircle size={14} /> Approve Account
        </button>
      </form>
      <form action={updateProviderStatus}>
        <input type="hidden" name="providerId" value={id} />
        <input type="hidden" name="status" value="suspended" />
        <button className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition">
          <XCircle size={14} /> Reject / Suspend
        </button>
      </form>
    </div>
  </div>
    </div >
  );
}

function ApprovePendingButton({ providerId, field, label }: { providerId: string; field: string; label: string }) {
  return (
    <form action={`/api/admin/approve-media`} method="POST">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="field" value={field} />
      <button className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 transition">
        <CheckCircle size={12} /> {label}
      </button>
    </form>
  );
}

function RejectPendingButton({ providerId, field, label }: { providerId: string; field: string; label: string }) {
  return (
    <form action={`/api/admin/reject-media`} method="POST">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="field" value={field} />
      <button className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition">
        <XCircle size={12} /> {label}
      </button>
    </form>
  );
}