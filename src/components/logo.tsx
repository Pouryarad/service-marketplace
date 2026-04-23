import Link from "next/link";

export function Logo({ centered = false }: { centered?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${centered ? "justify-center" : ""}`}
    >
      <span className="grid size-9 place-items-center rounded-2xl bg-[#2563eb] font-display text-lg font-bold text-white">
        F
      </span>
      <span className="font-display text-xl font-bold tracking-normal text-[#1f1f1f]">
        Findly
      </span>
    </Link>
  );
}
