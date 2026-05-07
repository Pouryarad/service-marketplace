import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/data";
import { grantAdminAccess } from "@/lib/actions";
import Stripe from "stripe";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import DiscountCodeForm from "./DiscountCodeForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function AdminSubscriptionsPage() {
    const supabase = await createSupabaseServerClient();
    const providers = await getProviders({ includeHidden: true });

    // Fetch Stripe coupons
    const coupons = await stripe.coupons.list({ limit: 20 });

    const activeProviders = providers.filter((p) => p.subscriptionStatus === "active");
    const trialingProviders = providers.filter((p) => (p as any).subscriptionStatus === "trialing");
    const expiredProviders = providers.filter((p) => !p.subscriptionStatus || p.subscriptionStatus === "expired");
    const adminGranted = providers.filter((p) => (p as any).admin_granted);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-bold text-[#1f1f1f] sm:text-2xl">Subscriptions</h1>
                <p className="mt-1 text-sm text-[#6b7280]">Manage provider subscriptions and discount codes.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: "Active", value: activeProviders.length, color: "bg-green-50 text-green-700" },
                    { label: "Trialing", value: trialingProviders.length, color: "bg-blue-50 text-blue-700" },
                    { label: "Expired", value: expiredProviders.length, color: "bg-red-50 text-red-700" },
                    { label: "Admin Granted", value: adminGranted.length, color: "bg-purple-50 text-purple-700" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${stat.color}`}>{stat.label}</p>
                        <p className="mt-2 text-2xl font-bold text-[#1f1f1f]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Discount Codes */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-[#1f1f1f]">Discount Codes</h2>
                    <Link
                        href="https://dashboard.stripe.com/test/coupons"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline"
                    >
                        Stripe Dashboard <ExternalLink size={11} />
                    </Link>
                </div>

                <DiscountCodeForm />

                {/* Existing Coupons */}
                {coupons.data.length > 0 && (
                    <div className="mt-5 space-y-2">
                        <p className="text-xs font-bold text-[#9ca3af]">EXISTING COUPONS</p>
                        {coupons.data.map((coupon) => (
                            <div key={coupon.id} className="flex items-center justify-between rounded-xl border border-black/5 px-4 py-3">
                                <div>
                                    <p className="font-bold text-sm text-[#1f1f1f]">{coupon.name ?? coupon.id}</p>
                                    <p className="text-xs text-[#6b7280]">
                                        {coupon.percent_off ? `${coupon.percent_off}% off` : `$${(coupon.amount_off ?? 0) / 100} off`}
                                        {coupon.duration === "repeating" ? ` · ${coupon.duration_in_months} months` : ` · ${coupon.duration}`}
                                        {coupon.max_redemptions ? ` · Max ${coupon.max_redemptions} uses` : ""}
                                    </p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${coupon.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {coupon.valid ? "Active" : "Inactive"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Providers List */}
            <div>
                <h2 className="text-base font-bold text-[#1f1f1f] mb-3">All Providers</h2>
                <div className="space-y-2">
                    {providers.map((provider) => (
                        <div key={provider.id} className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-sm text-[#1f1f1f]">{provider.fullName}</p>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${provider.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                                            (provider as any).subscriptionStatus === "trialing" ? "bg-blue-100 text-blue-700" :
                                                (provider as any).admin_granted ? "bg-purple-100 text-purple-700" :
                                                    "bg-red-100 text-red-700"
                                            }`}>
                                            {(provider as any).admin_granted ? "Admin Granted" : provider.subscriptionStatus ?? "No subscription"}
                                        </span>
                                        {(provider as any).early_bird && (
                                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">Early Bird</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#6b7280] mt-0.5">{provider.email}</p>
                                </div>

                                {!(provider as any).admin_granted && (
                                    <form action={grantAdminAccess}>
                                        <input type="hidden" name="providerId" value={provider.id} />
                                        <button className="rounded-full bg-purple-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-600 transition">
                                            Grant Free Access
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}