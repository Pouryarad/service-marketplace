"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import EditCategoryModal from "./EditCategoryModal";

type Category = {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    related_slugs: string[] | null;
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
                <EditCategoryModal category={editing} allCategories={categories} onClose={() => setEditing(null)} />
            )}

            <div className="space-y-2">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} className="size-9 rounded-xl object-cover shrink-0" />
                            ) : (
                                <div className="size-9 rounded-xl bg-[#f3f5f9] shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="font-bold text-[#1f1f1f] text-sm truncate">{cat.name}</p>
                                <p className="text-xs text-[#9ca3af] font-mono truncate">{cat.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setEditing(cat)}
                                className="grid size-8 place-items-center rounded-full border border-black/10 text-[#6b7280] hover:bg-[#f3f5f9] transition"
                            >
                                <Pencil size={13} />
                            </button>
                            <form action={deleteCategory}>
                                <input type="hidden" name="id" value={cat.id} />
                                <button className="grid size-8 place-items-center rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">
                                    <Trash2 size={13} />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}