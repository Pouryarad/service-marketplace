import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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
    .from("categories").select("*").order("name", { ascending: true });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#0f1117]">Categories</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">Manage service categories</p>
      </div>

      {/* Add */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.04]">
        <h2 className="font-black text-[#0f1117] mb-4">Add Category</h2>
        <form action={addCategory} className="flex gap-2">
          <input name="name" placeholder="e.g. Immigration Consultant" required
            className="h-11 flex-1 rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#0f1117] transition placeholder:text-[#c4c9d4]" />
          <button type="submit"
            className="rounded-xl bg-[#0f1117] px-5 py-2 text-sm font-bold text-white active:scale-95 transition-all">
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <CategoriesClient categories={categories ?? []} deleteCategory={deleteCategory} />
    </div>
  );
}
