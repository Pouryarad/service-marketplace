import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RequestDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
  .from("contact_requests")
  .select("*")
  .limit(1)
  .single();

  if (!data) return <div>Request not found</div>;

  return (
    <main className="min-h-screen bg-[#f3f5f9] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-sm text-gray-500 mb-3">
  <Link href="/dashboard" className="hover:underline">Dashboard</Link>
  <span className="mx-2">/</span>
  <Link href="/dashboard/requests" className="hover:underline">Requests</Link>
  <span className="mx-2">/</span>
  <span className="text-gray-700 font-medium">Details</span>
</div>

        <h1 className="text-2xl font-bold">Request Details</h1>

        <div className="bg-white rounded-[12px] p-6 shadow-sm space-y-4">

          {/* Client Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold">{data.name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold">{data.email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-semibold">{data.phone || "-"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-semibold capitalize">{data.status}</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs text-gray-500">Submitted</p>
            <p className="text-sm text-gray-600">
              {new Date(data.created_at).toLocaleString()}
            </p>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Message</p>
            <div className="bg-gray-50 rounded-[10px] p-4 text-sm text-gray-700 leading-relaxed">
              {data.message}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}