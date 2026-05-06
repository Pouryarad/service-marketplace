"use client";

import { useState, useRef } from "react";
import { saveProviderProfile } from "@/lib/actions";
import { X, Plus, ChevronDown } from "lucide-react";
import type { Provider } from "@/lib/types";

const BC_LOCATIONS = [
    "Abbotsford", "Burnaby", "Brentwood", "Coquitlam", "Delta",
    "Downtown Vancouver", "East Vancouver", "Kelowna", "Kitsilano",
    "Langley", "Maple Ridge", "Mission", "Mount Pleasant", "New Westminster",
    "North Vancouver", "Port Coquitlam", "Port Moody", "Richmond",
    "South Surrey", "Surrey", "Tsawwassen", "UBC", "Vancouver",
    "Victoria", "West End", "West Vancouver", "White Rock", "Yaletown",
];

const LANGUAGES = [
    "English", "French", "Mandarin", "Cantonese", "Punjabi", "Hindi",
    "Farsi", "Persian", "Arabic", "Spanish", "Korean", "Japanese", "Tagalog",
    "Vietnamese", "Portuguese", "Italian", "German", "Russian",
];

const CATEGORIES = [
    "Accountant", "Car Dealer", "Financial Advisor", "Immigration Consultant",
    "Insurance Broker", "Lawyer", "Mortgage Broker", "Notary Public",
    "Realtor", "Therapist", "Other",
];

const COUNTRY_CODES = [
    { code: "+1", label: "🇨🇦 +1 (CA/US)" },
    { code: "+44", label: "🇬🇧 +44 (UK)" },
    { code: "+61", label: "🇦🇺 +61 (AU)" },
    { code: "+98", label: "🇮🇷 +98 (IR)" },
    { code: "+92", label: "🇵🇰 +92 (PK)" },
    { code: "+91", label: "🇮🇳 +91 (IN)" },
    { code: "+86", label: "🇨🇳 +86 (CN)" },
    { code: "+82", label: "🇰🇷 +82 (KR)" },
    { code: "+81", label: "🇯🇵 +81 (JP)" },
    { code: "+34", label: "🇪🇸 +34 (ES)" },
    { code: "+49", label: "🇩🇪 +49 (DE)" },
    { code: "+33", label: "🇫🇷 +33 (FR)" },
    { code: "+55", label: "🇧🇷 +55 (BR)" },
    { code: "+7", label: "🇷🇺 +7 (RU)" },
];

function stripLinks(value: string) {
    return value
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/www\.\S+/gi, "")
        .replace(/\b\d[\d\s\-().]{6,}\d\b/g, "");
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const res = await fetch("/api/delete-account", { method: "POST" });
        if (res.ok) window.location.href = "/";
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-[#1f1f1f]">Delete Account</h2>
                <p className="mt-2 text-sm text-[#6b7280]">
                    This will permanently delete your account and all your data. This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-60"
                    >
                        {loading ? "Requesting..." : "Request Deletion"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProviderSetupForm({
    provider,
    userEmail,
}: {
    provider: Provider | null;
    userEmail: string;
}) {
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(
        provider?.profilePhotoUrl ?? ""
    );
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>(
        provider?.portfolioPhotoUrls ?? []
    );
    const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
        provider?.language ? provider.language.split(",").map((l) => l.trim()) : []
    );
    const [categoryValue, setCategoryValue] = useState(provider?.categoryName ?? "");
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState("");
    const [countryCode, setCountryCode] = useState(() => {
        if (!provider?.phone) return "+1";
        const match = provider.phone.match(/^(\+\d+)/);
        return match ? match[1] : "+1";
    });
    const [phoneNumber, setPhoneNumber] = useState(
        provider?.phone?.replace(/^\+\d+\s?/, "") ?? ""
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const portfolioInputRef = useRef<HTMLInputElement>(null);

    const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfilePhotoFile(file);
        setProfilePhotoPreview(URL.createObjectURL(file));
    };

    const handlePortfolioPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = 10 - portfolioPreviews.length;
        const toAdd = files.slice(0, remaining);
        setPortfolioFiles((prev) => [...prev, ...toAdd]);
        setPortfolioPreviews((prev) => [
            ...prev,
            ...toAdd.map((f) => URL.createObjectURL(f)),
        ]);
    };

    const removePortfolioPhoto = (index: number) => {
        setPortfolioPreviews((prev) => prev.filter((_, i) => i !== index));
        setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages((prev) => {
            if (prev.includes(lang)) {
                if (prev.length === 1) return prev;
                return prev.filter((l) => l !== lang);
            }
            if (prev.length >= 5) return prev;

            return [...prev, lang];
        });
    };

    const finalCategory = showCustomCategory ? customCategory : categoryValue;

    return (
        <>
            {showDeleteModal && (
                <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
            )}

            <form
                action={async (formData: FormData) => {
                    setSaving(true);
                    formData.set("phone", `${countryCode} ${phoneNumber}`);
                    formData.set("language", selectedLanguages.join(", "));
                    formData.set("categorySlug", finalCategory);
                    formData.set("existingProfilePhotoUrl", provider?.profilePhotoUrl ?? "");
                    formData.set(
                        "existingPortfolioUrls",
                        JSON.stringify(
                            portfolioPreviews.filter(
                                (url) => url.startsWith("http") && !url.startsWith("blob:")
                            )
                        )
                    );
                    await saveProviderProfile(formData);
                    window.location.href = "/provider/dashboard?profile=saved";
                }}
                className="space-y-6"
            >
                <input type="hidden" name="existingProfilePhotoUrl" value={provider?.profilePhotoUrl ?? ""} />
                {/* Profile Photo */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Profile Photo <span className="text-red-500">*</span>
                    </label>
                    {provider?.profilePhotoUrl && (
                        <p className="mt-1 text-xs text-yellow-600">
                            ⏳ New photos require admin approval before going live.
                        </p>
                    )}
                    <div className="mt-3 flex items-center gap-4">
                        {profilePhotoPreview ? (
                            <img
                                src={profilePhotoPreview}
                                alt="Preview"
                                className="size-20 rounded-full object-cover object-center ring-4 ring-white shadow-md"
                                style={{ imageRendering: "auto" }}
                            />
                        ) : (
                            <div className="size-20 rounded-full bg-[#f3f5f9] border-2 border-dashed border-black/20 flex items-center justify-center">
                                <Plus size={20} className="text-[#9ca3af]" />
                            </div>
                        )}
                        <label className="cursor-pointer rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#1f1f1f] hover:bg-[#f3f5f9] transition">
                            {profilePhotoPreview ? "Change Photo" : "Upload Photo"}
                            <input
                                type="file"
                                name="profilePhoto"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePhoto}
                            />
                        </label>
                    </div>
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="fullName"
                        required
                        defaultValue={provider?.fullName ?? ""}
                        placeholder="John Smith"
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition"
                    />
                </div>

                {/* Business Name */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Business Name{" "}
                        <span className="font-normal text-[#9ca3af]">(optional)</span>
                    </label>
                    <input
                        name="businessName"
                        defaultValue={provider?.businessName ?? ""}
                        placeholder="Smith Consulting Inc."
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Category <span className="text-red-500">*</span>
                    </label>
                    {!showCustomCategory ? (
                        <>
                            <div className="relative mt-2">
                                <select
                                    value={categoryValue}
                                    onChange={(e) => {
                                        if (e.target.value === "__custom__") {
                                            setShowCustomCategory(true);
                                        } else {
                                            setCategoryValue(e.target.value);
                                        }
                                    }}
                                    className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 pr-10 outline-none focus:border-[#2563eb] transition"
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="__custom__">+ Add my own category</option>
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                value={customCategory}
                                onChange={(e) => setCustomCategory(
                                    e.target.value.replace(/\b\w/g, (c) => c.toUpperCase())
                                )}
                                placeholder="Enter your category"
                                className="mt-2 h-12 w-full rounded-xl border border-[#ff8a00] px-4 outline-none focus:border-[#2563eb] transition"
                            />
                            <p className="mt-1 text-xs text-yellow-600">
                                ⏳ New categories require admin approval before going live.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }}
                                className="mt-1 text-xs text-[#2563eb] hover:underline"
                            >
                                ← Back to list
                            </button>
                        </>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="email"
                        type="email"
                        required
                        defaultValue={provider?.email ?? userEmail}
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition"
                    />
                    <p className="mt-1 text-xs text-[#9ca3af]">
                        This is the email clients will see — change it to your business email if different.
                    </p>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex gap-2 w-full overflow-hidden">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="h-12 w-32 shrink-0 rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-[#2563eb] transition text-sm"
                        >
                            {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                        </select>
                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="604 555 0100"
                            className="h-12 flex-1 rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2">
                        <select
                            name="location"
                            required
                            defaultValue={provider?.location ?? ""}
                            className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 pr-10 outline-none focus:border-[#2563eb] transition"
                        >
                            <option value="">Select your area</option>
                            {BC_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                    </div>
                </div>

                {/* Language */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Languages <span className="text-red-500">*</span>
                        <span className="ml-2 font-normal text-[#9ca3af]">
                            ({selectedLanguages.length === 0 ? "select at least 1, max 5" : `${selectedLanguages.length}/5 selected`})
                        </span>
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {LANGUAGES.map((lang) => {
                            const selected = selectedLanguages.includes(lang);
                            return (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => toggleLanguage(lang)}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${selected
                                        ? "bg-[#2563eb] text-white"
                                        : "border border-black/10 text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"
                                        }`}
                                >
                                    {lang}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* One Line */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        One-Line Description <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="oneLine"
                        required
                        defaultValue={provider?.oneLine ?? ""}
                        placeholder="Helping families immigrate to Canada since 2010."
                        maxLength={120}
                        onChange={(e) => {
                            e.target.value = stripLinks(e.target.value);
                        }}
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition"
                    />
                    <p className="mt-1 text-xs text-[#9ca3af]">No phone numbers or links allowed.</p>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Bio{" "}
                        <span className="font-normal text-[#9ca3af]">(optional)</span>
                    </label>
                    <textarea
                        name="bio"
                        defaultValue={provider?.bio ?? ""}
                        placeholder="Tell clients about your background, experience, and what makes you unique..."
                        rows={5}
                        onChange={(e) => {
                            e.target.value = stripLinks(e.target.value);
                        }}
                        className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#2563eb] transition resize-none"
                    />
                    <p className="mt-1 text-xs text-[#9ca3af]">No phone numbers or links allowed.</p>
                </div>

                {/* Video URL */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Introduction Video{" "}
                        <span className="font-normal text-[#9ca3af]">(optional)</span>
                    </label>
                    <input
                        name="videoUrl"
                        type="url"
                        defaultValue={(provider as any)?.videoUrl ?? ""}
                        placeholder="https://youtube.com/watch?v=..."
                        className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition"
                    />
                    <p className="mt-1 text-xs text-yellow-600">
                        ⏳ Video links require admin approval before going live.
                    </p>
                </div>

                {/* Portfolio Photos */}
                <div>
                    <label className="block text-sm font-semibold text-[#1f1f1f]">
                        Portfolio Photos{" "}
                        <span className="font-normal text-[#9ca3af]">(optional, up to 10)</span>
                    </label>
                    <p className="mt-1 text-xs text-yellow-600">
                        ⏳ Portfolio photos require admin approval before going live.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {portfolioPreviews.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3f5f9]">
                                <img src={url} alt="" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePortfolioPhoto(i)}
                                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {portfolioPreviews.length < 10 && (
                            <button
                                type="button"
                                onClick={() => portfolioInputRef.current?.click()}
                                className="aspect-square rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center gap-1 hover:border-[#2563eb] hover:bg-[#eff6ff] transition"
                            >
                                <Plus size={20} className="text-[#9ca3af]" />
                                <span className="text-xs text-[#9ca3af]">Add</span>
                            </button>
                        )}
                    </div>
                    <input
                        ref={portfolioInputRef}
                        type="file"
                        name="portfolioPhotos"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePortfolioPhotos}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save Profile"}
                </button>

                {/* Danger Zone */}
                <div className="border-t border-black/10 pt-6">
                    <h3 className="text-sm font-semibold text-[#1f1f1f]">Danger Zone</h3>
                    <p className="mt-1 text-xs text-[#9ca3af]">
                        Once deleted, your account and all data cannot be recovered.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="mt-3 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                    >
                        Delete Account
                    </button>
                </div>
            </form>
        </>
    );
}