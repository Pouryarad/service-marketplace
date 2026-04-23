import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { TopNav } from "@/components/nav";
import { SearchBox } from "@/components/search-box";
import { getCategories } from "@/lib/data";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[#f3f5f9] text-[#1f1f1f]">
      <TopNav />
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-12 pt-8 text-center sm:px-6 sm:pt-16">
        <Logo centered />
        <h1 className="mt-8 max-w-3xl font-display text-4xl font-bold leading-tight tracking-normal sm:text-6xl">
          Find the right service in your area in seconds
        </h1>
        <div className="mt-8 w-full">
          <SearchBox categories={categories} />
        </div>
        <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4b5563]">
          <ShieldCheck size={18} className="text-[#22c55e]" />
          Verified providers
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative min-h-48 overflow-hidden rounded-[8px] bg-[#1f1f1f]"
          >
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-left">
              <h2 className="font-display text-2xl font-bold text-white">
                {category.name}
              </h2>
            </div>
          </Link>
        ))}
      </section>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[#6b7280] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex gap-4">
            <Link href="/privacy">Privacy policy</Link>
            <a href="mailto:contact@findly.example">contact@findly.example</a>
          </div>
          <p>Copyright {new Date().getFullYear()} Findly Services</p>
        </div>
      </footer>
    </main>
  );
}
