"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

export default function EditCategoryModal({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [imageUrl, setImageUrl] = useState(category.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(category.image_url ?? "");
  const [saving, setSaving] = useState(false);

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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1f1f1f]">Edit Category</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-[#f3f5f9] transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1f1f1f]">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#2563eb] transition"
            />
          </div>

          {/* Image */}
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