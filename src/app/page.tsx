import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { TopNav } from "@/components/nav";
import { SearchBox } from "@/components/search-box";
import { getCategories } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string };
}) {

  // 👇 PUT IT HERE
  if (searchParams?.code) {
    redirect(`/auth/callback?code=${searchParams.code}`);
  }

  const categories = await getCategories();

  return (
    <main className="min-h-screen flex flex-col bg-[#f3f5f9] text-[#1f1f1f]">
      <section className="flex-1 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 pb-10 pt-6 text-center sm:px-6 sm:pt-10">
        <Logo centered />
        <h1 className="mt-6 max-w-3xl font-display text-3xl font-bold leading-tight tracking-normal sm:text-5xl">
          Find the right service in your area in seconds
        </h1>
        <div className="mt-10 w-full max-w-xl mx-auto">
          <SearchBox categories={categories} />
        </div>
        
      </section>
                <div className="mt-16 mb-8 flex justify-center">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#4b5563]">
              <ShieldCheck size={18} className="text-[#22c55e]" />
              Verified providers
            </p>
          </div>
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex items-center justify-center min-h-36 overflow-hidden rounded-2xl border border-black/10 bg-[#1f1f1f]"
            >
              <Image
                  src={category.imageUrl && !category.imageUrl.includes("1600518464441")
                      ? category.imageUrl
                      : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover opacity-10 group-hover:opacity-40 transition duration-300"
                />

              <div className="absolute inset-0 bg-gray/50 group-hover:bg-gray/20 transition duration-300" />

              <h2 className="relative z-10 font-display text-xl font-bold text-white text-center">
                {category.name}
              </h2>
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
