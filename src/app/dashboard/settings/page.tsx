import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateUserName } from "@/lib/actions";
import { updateProfile } from "@/lib/actions";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import Link from "next/link";


export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return <div>Not logged in</div>;
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (!user) return <div>Not logged in</div>;

    return (
        <main className="min-h-screen bg-[#f3f5f9] p-4 sm:p-6">
            <div className="max-w-xl mx-auto bg-white rounded-[16px] p-6 shadow-sm">
                <div className="text-sm text-gray-500 mb-4">
                    <Link href="/dashboard" className="hover:underline">
                        Dashboard
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 font-medium">
                        Settings
                    </span>
                </div>
                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                <form action={updateProfile} className="space-y-6">

                    {/* NAME */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Full Name</p>
                        <input
                            name="full_name"
                            defaultValue={profile?.full_name || ""}
                            className="w-full rounded-[10px] border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Phone</p>
                        <input
                            name="phone"
                            defaultValue={profile?.phone || ""}
                            className="w-full rounded-[10px] border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                        />
                    </div>

                    {/* CITY */}
                    <div>
                        <p className="text-sm font-semibold mb-1">City</p>
                        <input
                            name="city"
                            defaultValue={profile?.city || ""}
                            className="w-full rounded-[10px] border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                        />
                    </div>

                    {/* SAVE */}
                    <button className="w-full rounded-full bg-[#2563eb] text-white py-2 font-semibold hover:opacity-90 transition">
                        Save Changes
                    </button>

                </form>

                {/* EMAIL */}
                <div className="mt-8">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-sm">{user.email}</p>
                </div>

                {/* SIGN OUT */}
                <form action="/auth/logout" method="post" className="mt-4">
                    <button className="rounded-full bg-black text-white px-4 py-2 text-sm">
                        Sign out
                    </button>
                </form>

                {/* DELETE */}
                <div className="mt-10 pt-6 border-t">
                    <DeleteAccountModal />
                </div>

            </div>
        </main>
    );
}