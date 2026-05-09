"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type PromoCode = {
    id: string;
    code: string;
    active: boolean;
    timesRedeemed: number;
    maxRedemptions: number | null;
    expiresAt: string | null;
};

type Coupon = {
    id: string;
    name: string;
    discount: string;
    duration: string;
    timesRedeemed: number;
    maxRedemptions: number | null;
    valid: boolean;
    promoCodes: PromoCode[];
};

export default function CouponList({ coupons }: { coupons: Coupon[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<string | null>(null);

    if (coupons.length === 0) return null;

    const handleCancel = async (couponId: string, promoCodeId?: string) => {
        const key = promoCodeId ?? couponId;
        setCancelling(key);
        await fetch("/admin/cancel-coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ couponId, promoCodeId }),
        });
        window.location.reload();
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
            <h2 className="font-black text-[#0f1117] mb-4">Active Codes</h2>
            <div className="space-y-2">
                {coupons.map((c) => (
                    <div key={c.id} className="rounded-xl border border-black/[0.06] overflow-hidden">
                        {/* Coupon row */}
                        <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#f9fafb]"
                            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {expanded === c.id ? <ChevronDown size={14} className="text-[#9ca3af] shrink-0" /> : <ChevronRight size={14} className="text-[#9ca3af] shrink-0" />}
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-[#0f1117] truncate">{c.name}</p>
                                    <p className="text-xs text-[#9ca3af]">
                                        {c.discount} · {c.duration}
                                        {c.maxRedemptions ? ` · Max ${c.maxRedemptions}` : ""}
                                        {" · "}{c.timesRedeemed} used
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.valid ? "bg-green-100 text-green-700" : "bg-[#f0f2f7] text-[#9ca3af]"}`}>
                                    {c.valid ? "Active" : "Inactive"}
                                </span>
                                {c.valid && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCancel(c.id); }}
                                        disabled={cancelling === c.id}
                                        className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                                    >
                                        {cancelling === c.id ? "..." : "Delete"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Promo codes */}
                        {expanded === c.id && c.promoCodes.length > 0 && (
                            <div className="border-t border-black/[0.04] bg-[#f9fafb]">
                                {c.promoCodes.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between px-6 py-2.5 border-b border-black/[0.04] last:border-0">
                                        <div>
                                            <p className="font-mono text-sm font-bold text-[#0f1117]">{p.code}</p>
                                            <p className="text-xs text-[#9ca3af]">
                                                {p.timesRedeemed} used
                                                {p.maxRedemptions ? ` / ${p.maxRedemptions} max` : ""}
                                                {p.expiresAt ? ` · Expires ${p.expiresAt}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {expanded === c.id && c.promoCodes.length === 0 && (
                            <div className="border-t border-black/[0.04] bg-[#f9fafb] px-6 py-3">
                                <p className="text-xs text-[#9ca3af]">No promo codes attached</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}