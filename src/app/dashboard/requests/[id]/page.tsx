import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!data) return (
    <main className="min-h-screen bg-[#f3f5f9] p-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-[#6b7280]">Request not found.</p>
        <Link href="/dashboard" className="text-[#2563eb] text-sm hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f3f5f9] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-sm text-gray-500 mb-3">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Request Details</span>
        </div>

        <h1 className="text-2xl font-bold">Request Details</h1>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#9ca3af]">Name</p>
              <p className="font-semibold text-[#1f1f1f]">{data.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#9ca3af]">Email</p>
              <p className="font-semibold text-[#1f1f1f]">{data.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#9ca3af]">Phone</p>
              <p className="font-semibold text-[#1f1f1f]">{data.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#9ca3af]">Status</p>
              <p className="font-semibold capitalize text-[#1f1f1f]">{data.status}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#9ca3af]">Submitted</p>
            <p className="text-sm text-[#6b7280]">
              {new Date(data.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#9ca3af] mb-1">Message</p>
            <div className="bg-[#f3f5f9] rounded-xl p-4 text-sm text-[#1f1f1f] leading-relaxed">
              {data.message}
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="text-sm text-[#2563eb] hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}