"use client";

import { useState, useRef } from "react";
import { saveProviderProfile } from "@/lib/actions";
import { X, Plus, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import type { Provider } from "@/lib/types";
import Image from "next/image";

const BC_LOCATIONS = [
  "Abbotsford", "Burnaby", "Brentwood", "Coquitlam", "Delta",
  "Downtown Vancouver", "East Vancouver", "Kelowna", "Kitsilano",
  "Langley", "Maple Ridge", "Mission", "Mount Pleasant", "New Westminster",
  "North Vancouver", "Port Coquitlam", "Port Moody", "Richmond",
  "South Surrey", "Surrey", "Tsawwassen", "UBC", "Vancouver",
  "Victoria", "West End", "West Vancouver", "White Rock", "Yaletown",
];

const LANGUAGES = [
  "English", "French", "Mandarin", "Cantonese", "Punjabi", "Hindi", "Persian", "Arabic", "Spanish", "Korean", "Japanese", "Tagalog",
  "Vietnamese", "Portuguese", "Italian", "German", "Russian", "Other",
];

// Categories now come from DB via props

const COUNTRY_CODES = [
  { code: "+1", label: "🇨🇦 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+98", label: "🇮🇷 +98" },
  { code: "+92", label: "🇵🇰 +92" },
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+86", label: "🇨🇳 +86" },
  { code: "+82", label: "🇰🇷 +82" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+34", label: "🇪🇸 +34" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+55", label: "🇧🇷 +55" },
  { code: "+7", label: "🇷🇺 +7" },
];

function stripLinks(value: string) {
  return value
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/www\.\S+/gi, "")
    .replace(/\b\d[\d\s\-().]{6,}\d\b/g, "");
}

function isYoutubeUrl(url: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
}

const STEPS = ["Basic Info", "Contact", "Your Story", "Verify"];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition ${i < step ? "bg-[#2563eb] text-white" :
              i === step ? "bg-[#2563eb] text-white ring-4 ring-[#2563eb]/20" :
                "bg-[#f3f5f9] text-[#9ca3af]"
              }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${i === step ? "text-[#2563eb]" : "text-[#9ca3af]"
              }`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-[#f3f5f9] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
          style={{ width: `${(step / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
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
  categoriesJson = "[]",
}: {
  provider: Provider | null;
  userEmail: string;
  categoriesJson?: string;
}) {
  const categories: { slug: string; name: string }[] = JSON.parse(categoriesJson);
  const isFirstTime = !provider;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 state
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(provider?.profilePhotoUrl ?? "");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState(provider?.fullName ?? "");
  const [businessName, setBusinessName] = useState(provider?.businessName ?? "");
  const [categoryValue, setCategoryValue] = useState(provider?.categoryName ?? "");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Step 2 state
  const [email, setEmail] = useState(provider?.email ?? userEmail);
  const [countryCode, setCountryCode] = useState(() => {
    if (!provider?.phone) return "+1";
    const match = provider.phone.match(/^(\+\d+)/);
    return match ? match[1] : "+1";
  });
  const [phoneNumber, setPhoneNumber] = useState(provider?.phone?.replace(/^\+\d+\s?/, "") ?? "");
  const [location, setLocation] = useState(provider?.location ?? "");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    provider?.language ? provider.language.split(",").map((l) => l.trim()) : []
  );

  // Step 3 state
  const [oneLine, setOneLine] = useState(provider?.oneLine ?? "");
  const [bio, setBio] = useState(provider?.bio ?? "");
  const [videoUrl, setVideoUrl] = useState((provider as any)?.videoUrl ?? "");

  // Step 4 state
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>(provider?.portfolioPhotoUrls ?? []);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState("");

  const portfolioInputRef = useRef<HTMLInputElement>(null);

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
    setPortfolioPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const removePortfolioPhoto = (index: number) => {
    setPortfolioPreviews((prev) => prev.filter((_, i) => i !== index));
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const finalCategory = showCustomCategory ? customCategory : categoryValue;

  // Validation per step
  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!profilePhotoPreview) errs.profilePhoto = "Profile photo is required";
      if (!fullName.trim()) errs.fullName = "Full name is required";
      if (!finalCategory) errs.category = "Category is required";
    }
    if (s === 1) {
      if (!email.trim()) errs.email = "Email is required";
      if (!phoneNumber.trim()) errs.phone = "Phone is required";
      if (!location) errs.location = "Location is required";
      if (selectedLanguages.length === 0) errs.language = "Select at least one language";
    }
    if (s === 2) {
      if (!oneLine.trim()) errs.oneLine = "One-line description is required";
      if (videoUrl && !isYoutubeUrl(videoUrl)) errs.videoUrl = "Only YouTube links are allowed";
    }
    if (s === 3) {
      if (isFirstTime && !idFile) errs.idFile = "ID or license upload is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSaving(true);

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("businessName", businessName);
    formData.set("categorySlug", finalCategory);
    formData.set("email", email);
    formData.set("phone", `${countryCode} ${phoneNumber}`);
    formData.set("location", location);
    formData.set("language", selectedLanguages.join(", "));
    formData.set("oneLine", oneLine);
    formData.set("bio", bio);
    formData.set("videoUrl", videoUrl);
    formData.set("existingProfilePhotoUrl", provider?.profilePhotoUrl ?? "");
    formData.set("existingPortfolioUrls", JSON.stringify(
      portfolioPreviews.filter((url) => url.startsWith("http") && !url.startsWith("blob:"))
    ));

   if (profilePhotoFile) formData.set("profilePhoto", profilePhotoFile);
    portfolioFiles.forEach((f) => formData.append("portfolioPhotos", f));
    if (idFile) formData.set("idDocument", idFile);

    try {
      await saveProviderProfile(formData);
      await new Promise(r => setTimeout(r, 3000));
      window.location.href = isFirstTime
        ? "/provider/setup?tab=payment"
        : "/provider/dashboard?profile=saved";
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        window.location.href = isFirstTime
          ? "/provider/setup?tab=payment"
          : "/provider/dashboard?profile=saved";
        return;
      }
      console.error("Save failed:", err);
      setSaving(false);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!isFirstTime) {
    return (
      <>
        {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}

        <div className="space-y-8">

          {/* Basic Info */}
          <section>
            <h2 className="text-base font-bold text-[#1f1f1f] mb-4">Basic Info</h2>
            <div className="space-y-5">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Profile Photo <span className="text-red-500">*</span></label>
                <div className="mt-3 flex items-center gap-4">
                  {profilePhotoPreview ? (
                    <Image src={profilePhotoPreview} alt="Preview" width={80} height={80} className="size-20 rounded-full object-cover ring-4 ring-white shadow-md" />
                  ) : (
                    <div className="size-20 rounded-full bg-[#f3f5f9] border-2 border-dashed border-black/20 flex items-center justify-center">
                      <Plus size={20} className="text-[#9ca3af]" />
                    </div>
                  )}
                  <label className="cursor-pointer rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#1f1f1f] hover:bg-[#f3f5f9] transition">
                    {profilePhotoPreview ? "Change Photo" : "Upload Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
                  </label>
                </div>
                {provider?.pendingProfilePhotoUrl && (
                  <p className="mt-1 text-xs text-yellow-600">⏳ New photos require admin approval.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Full Name <span className="text-red-500">*</span></label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Business Name <span className="font-normal text-[#9ca3af]">(optional)</span></label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Smith Consulting Inc." className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Category <span className="text-red-500">*</span></label>
                {!showCustomCategory ? (
                  <div className="relative mt-2">
                    <select value={categoryValue} onChange={(e) => { if (e.target.value === "__custom__") { setShowCustomCategory(true); } else { setCategoryValue(e.target.value); } }} className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 pr-10 outline-none focus:border-[#2563eb] transition">
                      <option value="">Select a category</option>
                      {categories.map((cat) => <option key={cat.slug} value={cat.name}>{cat.name}</option>)}
                      <option value="__custom__">+ Add my own category</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  </div>
                ) : (
                  <>
                    <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value.replace(/\b\w/g, (c) => c.toUpperCase()))} placeholder="Enter your category" className="mt-2 h-12 w-full rounded-xl border border-[#ff8a00] px-4 outline-none focus:border-[#2563eb] transition" />
                    <p className="mt-1 text-xs text-yellow-600">⏳ New categories require admin approval.</p>
                    <button type="button" onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }} className="mt-1 text-xs text-[#2563eb] hover:underline">← Back to list</button>
                  </>
                )}
              </div>
            </div>
          </section>

          <div className="border-t border-black/5" />

          {/* Contact */}
          <section>
            <h2 className="text-base font-bold text-[#1f1f1f] mb-4">Contact & Location</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Business Email <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Phone <span className="text-red-500">*</span></label>
                <div className="mt-2 flex gap-2">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="h-12 w-28 shrink-0 rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-[#2563eb] transition text-sm">
                    {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="604 555 0100" className="h-12 flex-1 rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Location <span className="text-red-500">*</span></label>
                <div className="relative mt-2">
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 pr-10 outline-none focus:border-[#2563eb] transition">
                    <option value="">Select your area</option>
                    {BC_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Languages <span className="text-red-500">*</span> <span className="font-normal text-[#9ca3af]">({selectedLanguages.length}/5)</span></label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const selected = selectedLanguages.includes(lang);
                    return (
                      <button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${selected ? "bg-[#2563eb] text-white" : "border border-black/10 text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"}`}>
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-black/5" />

          {/* Your Story */}
          <section>
            <h2 className="text-base font-bold text-[#1f1f1f] mb-4">Your Story</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">One-Line Description <span className="text-red-500">*</span></label>
                <p className="mt-0.5 text-xs text-[#9ca3af]">Shows in search results. Max 120 chars.</p>
                <input value={oneLine} onChange={(e) => setOneLine(stripLinks(e.target.value).slice(0, 120))} placeholder="Helping families immigrate to Canada since 2010." className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
                <p className="mt-1 text-right text-xs text-[#9ca3af]">{oneLine.length}/120</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Bio <span className="font-normal text-[#9ca3af]">(optional)</span></label>
                <p className="mt-0.5 text-xs text-[#9ca3af]">Shows on your profile page. Max 600 chars.</p>
                <textarea value={bio} onChange={(e) => setBio(stripLinks(e.target.value).slice(0, 600))} placeholder="Tell clients about your background..." rows={5} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#2563eb] transition resize-none" />
                <p className="mt-1 text-right text-xs text-[#9ca3af]">{bio.length}/600</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f1f1f]">Introduction Video <span className="font-normal text-[#9ca3af]">(optional)</span></label>
                <p className="mt-0.5 text-xs text-[#9ca3af]">YouTube links only. Set your video to <strong>Unlisted</strong> so it won't appear on your channel.</p>
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
                {videoUrl && isYoutubeUrl(videoUrl) && <p className="mt-1 text-xs text-yellow-600">⏳ Video requires admin approval.</p>}
                {videoUrl && !isYoutubeUrl(videoUrl) && <p className="mt-1 text-xs text-red-500">Only YouTube links are allowed.</p>}
              </div>
            </div>
          </section>

          <div className="border-t border-black/5" />

          {/* Portfolio */}
          <section>
            <h2 className="text-base font-bold text-[#1f1f1f] mb-4">Portfolio</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {portfolioPreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3f5f9]">
                  <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  <button type="button" onClick={() => removePortfolioPhoto(i)} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {portfolioPreviews.length < 10 && (
                <button type="button" onClick={() => portfolioInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center gap-1 hover:border-[#2563eb] hover:bg-[#eff6ff] transition">
                  <Plus size={20} className="text-[#9ca3af]" />
                  <span className="text-xs text-[#9ca3af]">Add</span>
                </button>
              )}
            </div>
            <input ref={portfolioInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioPhotos} />
          </section>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {/* Danger Zone */}
          <div className="border-t border-black/10 pt-6">
            <h3 className="text-sm font-semibold text-[#1f1f1f]">Danger Zone</h3>
            <p className="mt-1 text-xs text-[#9ca3af]">Once deleted, your account cannot be recovered.</p>
            <button type="button" onClick={() => setShowDeleteModal(true)} className="mt-3 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition">
              Delete Account
            </button>
          </div>

        </div>
      </>
    );
  }

  return (
    <>
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}

      <ProgressBar step={step} total={STEPS.length} />

      {/* STEP 1 — Basic Info */}
      {step === 0 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#1f1f1f]">Basic Info</h2>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Profile Photo <span className="text-red-500">*</span></label>
            <div className="mt-3 flex items-center gap-4">
              {profilePhotoPreview ? (
                <Image src={profilePhotoPreview} alt="Preview" width={80} height={80} className="size-20 rounded-full object-cover ring-4 ring-white shadow-md" />
              ) : (
                <div className="size-20 rounded-full bg-[#f3f5f9] border-2 border-dashed border-black/20 flex items-center justify-center">
                  <Plus size={20} className="text-[#9ca3af]" />
                </div>
              )}
              <label className="cursor-pointer rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#1f1f1f] hover:bg-[#f3f5f9] transition">
                {profilePhotoPreview ? "Change Photo" : "Upload Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
              </label>
            </div>
            {errors.profilePhoto && <p className="mt-1 text-xs text-red-500">{errors.profilePhoto}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Full Name <span className="text-red-500">*</span></label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" className={`mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:border-[#2563eb] transition ${errors.fullName ? "border-red-400" : "border-black/10"}`} />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Business Name <span className="font-normal text-[#9ca3af]">(optional)</span></label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Smith Consulting Inc." className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#2563eb] transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Category <span className="text-red-500">*</span></label>
            {!showCustomCategory ? (
              <div className="relative mt-2">
                <select value={categoryValue} onChange={(e) => { if (e.target.value === "__custom__") { setShowCustomCategory(true); } else { setCategoryValue(e.target.value); } }} className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 outline-none focus:border-[#2563eb] transition ${errors.category ? "border-red-400" : "border-black/10"}`}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => <option key={cat.slug} value={cat.name}>{cat.name}</option>)}
                  <option value="__custom__">+ Add my own category</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              </div>
            ) : (
              <>
                <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value.replace(/\b\w/g, (c) => c.toUpperCase()))} placeholder="Enter your category" className="mt-2 h-12 w-full rounded-xl border border-[#ff8a00] px-4 outline-none focus:border-[#2563eb] transition" />
                <p className="mt-1 text-xs text-yellow-600">⏳ New categories require admin approval.</p>
                <button type="button" onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }} className="mt-1 text-xs text-[#2563eb] hover:underline">← Back to list</button>
              </>
            )}
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>
        </div>
      )}

      {/* STEP 2 — Contact */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#1f1f1f]">Contact & Location</h2>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Business Email <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:border-[#2563eb] transition ${errors.email ? "border-red-400" : "border-black/10"}`} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Phone <span className="text-red-500">*</span></label>
            <div className="mt-2 flex gap-2">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="h-12 w-28 shrink-0 rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-[#2563eb] transition text-sm">
                {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="604 555 0100" className={`h-12 flex-1 rounded-xl border px-4 outline-none focus:border-[#2563eb] transition ${errors.phone ? "border-red-400" : "border-black/10"}`} />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Location <span className="text-red-500">*</span></label>
            <div className="relative mt-2">
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 outline-none focus:border-[#2563eb] transition ${errors.location ? "border-red-400" : "border-black/10"}`}>
                <option value="">Select your area</option>
                {BC_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            </div>
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Languages <span className="text-red-500">*</span> <span className="font-normal text-[#9ca3af]">({selectedLanguages.length}/5)</span></label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const selected = selectedLanguages.includes(lang);
                return (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${selected ? "bg-[#2563eb] text-white" : "border border-black/10 text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"}`}>
                    {lang}
                  </button>
                );
              })}
            </div>
            {errors.language && <p className="mt-1 text-xs text-red-500">{errors.language}</p>}
          </div>
        </div>
      )}

      {/* STEP 3 — Your Story */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#1f1f1f]">Your Story</h2>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">One-Line Description <span className="text-red-500">*</span></label>
            <p className="mt-0.5 text-xs text-[#9ca3af]">Shows in search results. Max 120 chars.</p>
            <input value={oneLine} onChange={(e) => setOneLine(stripLinks(e.target.value).slice(0, 120))} placeholder="Helping families immigrate to Canada since 2010." className={`mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:border-[#2563eb] transition ${errors.oneLine ? "border-red-400" : "border-black/10"}`} />
            <p className="mt-1 text-right text-xs text-[#9ca3af]">{oneLine.length}/120</p>
            {errors.oneLine && <p className="mt-1 text-xs text-red-500">{errors.oneLine}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Bio <span className="font-normal text-[#9ca3af]">(optional)</span></label>
            <p className="mt-0.5 text-xs text-[#9ca3af]">Shows on your profile page. Max 600 chars.</p>
            <textarea value={bio} onChange={(e) => setBio(stripLinks(e.target.value).slice(0, 600))} placeholder="Tell clients about your background..." rows={5} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#2563eb] transition resize-none" />
            <p className="mt-1 text-right text-xs text-[#9ca3af]">{bio.length}/600</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Introduction Video <span className="font-normal text-[#9ca3af]">(optional)</span></label>
            <p className="mt-0.5 text-xs text-[#9ca3af]">YouTube links only.</p>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={`mt-2 h-12 w-full rounded-xl border px-4 outline-none focus:border-[#2563eb] transition ${errors.videoUrl ? "border-red-400" : "border-black/10"}`} />
            {errors.videoUrl && <p className="mt-1 text-xs text-red-500">{errors.videoUrl}</p>}
            {videoUrl && !errors.videoUrl && <p className="mt-1 text-xs text-yellow-600">⏳ Video requires admin approval.</p>}
          </div>
        </div>
      )}

      {/* STEP 4 — Portfolio & Verify */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#1f1f1f]">Portfolio & Verification</h2>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Portfolio Photos <span className="font-normal text-[#9ca3af]">(optional, up to 10)</span></label>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {portfolioPreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3f5f9]">
                  <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  <button type="button" onClick={() => removePortfolioPhoto(i)} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {portfolioPreviews.length < 10 && (
                <button type="button" onClick={() => portfolioInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center gap-1 hover:border-[#2563eb] hover:bg-[#eff6ff] transition">
                  <Plus size={20} className="text-[#9ca3af]" />
                  <span className="text-xs text-[#9ca3af]">Add</span>
                </button>
              )}
            </div>
            <input ref={portfolioInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioPhotos} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">ID / Driver{"'"}s License <span className="text-red-500">*</span></label>
            <p className="mt-0.5 text-xs text-[#9ca3af]">Required for verification. Only seen by admins. Kept confidential.</p>
            <div className="mt-3">
              {idPreview ? (
                <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-black/10">
                  <Image src={idPreview} alt="ID Preview" width={400} height={250} className="w-full object-cover" />
                  <button type="button" onClick={() => { setIdFile(null); setIdPreview(""); }} className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:bg-[#f3f5f9] transition ${errors.idFile ? "border-red-400" : "border-black/10"}`}>
                  <Plus size={24} className="text-[#9ca3af]" />
                  <span className="text-sm text-[#6b7280] font-medium">Upload ID or License</span>
                  <span className="text-xs text-[#9ca3af]">JPG, PNG or PDF</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIdFile(file);
                    if (file.type.startsWith("image/")) setIdPreview(URL.createObjectURL(file));
                  }} />
                </label>
              )}
              {idFile && !idPreview && <p className="mt-2 text-xs text-[#6b7280]">📄 {idFile.name}</p>}
            </div>
            {errors.idFile && <p className="mt-1 text-xs text-red-500">{errors.idFile}</p>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={handleBack} className="flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={handleNext} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60">
            {saving ? "Saving..." : "Get Verified →"}
          </button>
        )}
      </div>
    </>
  );
}
