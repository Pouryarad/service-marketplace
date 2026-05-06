import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { SearchBox } from "@/components/search-box";
import { getCategories } from "@/lib/data";
import ClientRedirect from "@/components/ClientRedirect";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen flex flex-col bg-[#f3f5f9] text-[#1f1f1f] overflow-x-hidden">

      <ClientRedirect />

      {/* HERO */}
      <section className="flex-1 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 pt-10 pb-12 text-center sm:px-6 sm:pt-14 md:pt-20 lg:pt-24 lg:pb-16">

        <div className="scale-90 sm:scale-100">
          <Logo centered size="lg" />
        </div>

        <h1 className="mt-6 max-w-[95%] sm:max-w-3xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Find the right service in your area in seconds
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
          Connect with trusted local professionals near you, from therapists and realtors to mortgage brokers and immigration consultants.
        </p>

        <div className="mt-8 w-full max-w-xl">
          <SearchBox />
        </div>

        <div className="mt-8 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4b5563] shadow-sm border border-black/5">
            <ShieldCheck size={18} className="text-[#22c55e]" />
            Verified providers
          </p>
        </div>

      </section>

      {/* CATEGORIES */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">
            Explore Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex min-h-[160px] sm:min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#1f1f1f] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Image
                src={
                  category.imageUrl &&
                    !category.imageUrl.includes("1600518464441")
                    ? category.imageUrl
                    : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                }
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-40 transition duration-300"
              />

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition duration-300" />

              <h2 className="relative z-10 px-4 text-center font-display text-lg font-bold text-white sm:text-xl lg:text-2xl">
                {category.name}
              </h2>
            </Link>
          ))}
        </div>

      </section>
      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white mt-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-[#6b7280] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-center sm:text-left">
            <Link href="/privacy" className="hover:text-black transition">
              Privacy policy
            </Link>

            <a
              href="mailto:contact@findly.example"
              className="hover:text-black transition"
            >
              contact@findly.example
            </a>
          </div>

          <p className="text-center sm:text-right">
            Copyright {new Date().getFullYear()} Findly Services
          </p>

        </div>
      </footer>
    </main>
  );
}