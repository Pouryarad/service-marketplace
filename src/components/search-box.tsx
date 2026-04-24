"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Category } from "@/lib/types";

export function SearchBox({ categories }: { categories: Category[] }) {
  const router = useRouter();

  return (
    <form
      className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-black/10 bg-white p-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const query = String(form.get("query") ?? "").toLowerCase();
        const match =
          categories.find((category) => category.name.toLowerCase().includes(query)) ??
          categories[0];
        router.push(`/categories/${match.slug}`);
      }}
    >
      <Search className="ml-3 text-[#9ca3af]" size={21} />
      <input
        name="query"
        placeholder="Search for Therapist, Lawyer, Real Estate..."
        className="h-12 min-w-0 flex-1 bg-transparent text-base text-[#1f1f1f] placeholder:text-[#9ca3af]"
      />
      <button className="rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white">
        Search
      </button>
    </form>
  );
}
