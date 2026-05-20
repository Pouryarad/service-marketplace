"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  related_slugs: string[] | null;
};

export default function EditCategoryModal({
  category,
  allCategories,
  onClose,
}: {
  category: Category;
  allCategories: Category[];
  onClose: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [imageUrl, setImageUrl] = useState(category.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(category.image_url ?? "");
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>(category.related_slugs ?? []);
  const [saving, setSaving] = useState(false);

  const otherCategories = allCategories.filter((c) => c.id !== category.id);

  const toggleRelated = (slug: string) => {
    setRelatedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setImageUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.set("id", String(category.id));
    formData.set("name", name);
    formData.set("imageUrl", imageUrl);
    formData.set("relatedSlugs", JSON.stringify(relatedSlugs));
    if (imageFile) formData.set("imageFile", imageFile);

    await fetch("/api/admin/update-category", {
      method: "POST",
      body: formData,
    });

    setSaving(false);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1f1f1f]">Edit Category</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-[#f3f5f9] transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#2563eb] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Image</label>
            {preview && (
              <img src={preview} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover border border-black/10" />
            )}
            <div className="mt-2 space-y-2">
              <input
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setPreview(e.target.value); setImageFile(null); }}
                placeholder="Paste image URL..."
                className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#2563eb] transition"
              />
              <p className="text-xs text-center text-[#9ca3af]">or</p>
              <label className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-black/20 text-sm text-[#6b7280] hover:bg-[#f3f5f9] transition">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">
              Related Categories
              <span className="ml-1 text-xs font-normal text-[#9ca3af]">({relatedSlugs.length}/3 selected)</span>
            </label>
            <p className="text-xs text-[#9ca3af] mt-0.5 mb-2">Shown as suggestions on this category's provider profiles</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {otherCategories.map((cat) => {
                const selected = relatedSlugs.includes(cat.slug);
                const disabled = !selected && relatedSlugs.length >= 3;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleRelated(cat.slug)}
                    disabled={disabled}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb] font-semibold"
                        : disabled
                        ? "border-black/5 bg-[#f9f9f9] text-[#c4c9d4] cursor-not-allowed"
                        : "border-black/10 text-[#1f1f1f] hover:bg-[#f3f5f9]"
                    }`}
                  >
                    {selected && <Check size={13} className="shrink-0" />}
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-black/10 py-2.5 text-sm font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-full bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}