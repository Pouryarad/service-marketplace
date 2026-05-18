import Image from "next/image";
import Link from "next/link";

export function Logo({ centered, size = "sm" }: { centered?: boolean; size?: "sm" | "lg" }) {
  return (
    <Link href="/" className={`inline-flex ${centered ? "justify-center w-full" : ""}`}>
      <Image
        src="/logo.png"
        alt="ProFindly"
        width={size === "lg" ? 240 : 120}
        height={size === "lg" ? 72 : 36}
        className={`w-auto object-contain ${size === "lg" ? "h-20" : "h-10"}`}
        priority
      />
    </Link>
  );
}