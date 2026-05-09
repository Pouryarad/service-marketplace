import Link from "next/link";
import { Bell } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";

export default async function AdminBell() {
  const supabase = await createSupabaseServerClient();
  const providers = await getProviders({ includeHidden: true });

  const pendingAccounts = providers.filter((p) => !p.approved && !p.suspended).length;

  const { data: pendingMedia } = await supabase!
  .from("providers")
  .select("id, pending_profile_photo_url, pending_portfolio_photo_urls, pending_video_url, pending_category_slug")
  .or("pending_profile_photo_url.not.is.null,pending_video_url.not.is.null,pending_category_slug.not.is.null,pending_portfolio_photo_urls.not.is.null");

const realPendingMedia = (pendingMedia ?? []).filter((p) =>
  p.pending_profile_photo_url ||
  p.pending_video_url ||
  p.pending_category_slug ||
  (Array.isArray(p.pending_portfolio_photo_urls) && p.pending_portfolio_photo_urls.length > 0)
);

  const total = pendingAccounts + realPendingMedia.length;

  if (total === 0) {
    return (
      <Link href="/admin/approvals" className="relative flex items-center justify-center size-9 rounded-full hover:bg-white/5 transition">
        <Bell size={18} className="text-white/50" />
      </Link>
    );
  }

  return (
    <Link href="/admin/approvals" className="relative flex items-center justify-center size-9 rounded-full hover:bg-white/5 transition">
      <Bell size={18} className="text-white" />
      <span className="absolute -top-0.5 -right-0.5 size-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white">
        {total > 9 ? "9+" : total}
      </span>
    </Link>
  );
}