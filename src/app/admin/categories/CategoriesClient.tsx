"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import EditCategoryModal from "./EditCategoryModal";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

export default function CategoriesClient({
  categories,
  deleteCategory,
}: {
  categories: Category[];
  deleteCategory: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Category | null>(null);

  return (
    <>
      {editing && (
        <EditCategoryModal category={editing} onClose={() => setEditing(null)} />
      )}

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm min-w-[400px]">
          <thead className="border-b border-black/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af]">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#9ca3af] hidden sm:table-cell">Image</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-[#9ca3af]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-[#f3f5f9] transition">
                <td className="px-4 py-3 font-medium text-[#1f1f1f]">{cat.name}</td>
                <td className="px-4 py-3 text-[#6b7280] font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} width={32} height={32} className="size-8 rounded-lg object-cover" />
                  ) : (
                    <span className="text-xs text-[#9ca3af]">No image</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(cat)}
                      className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-bold text-[#1f1f1f] hover:bg-[#f3f5f9] transition"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={11} /> Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}