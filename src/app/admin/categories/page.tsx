import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import CategoriesClient from "./CategoriesClient";

async function addCategory(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const name = String(formData.get("name") ?? "").trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!name || !supabase) return;
  await supabase.from("categories").insert({ name, slug });
  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const id = Number(formData.get("id"));
  if (!supabase) return;
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: categories } = await supabase!
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1f1f1f] sm:text-2xl">Categories</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Manage service categories.</p>
      </div>

      {/* Add Category */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold text-[#1f1f1f] mb-4">Add New Category</h2>
        <form action={addCategory} className="flex gap-3">
          <input
            name="name"
            placeholder="e.g. Immigration Consultant"
            className="h-11 flex-1 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#2563eb] transition"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-[#2563eb] px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* Categories List */}
      {/* Categories List */}
      <CategoriesClient
        categories={categories ?? []}
        deleteCategory={deleteCategory}
      />
    </div>
  );
}