import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/nav";
import { getCurrentUser } from "@/lib/data";
import { getCurrentUserRole } from "@/lib/data";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Findly Services",
  description: "A modern service marketplace powered by Next.js and Supabase.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getCurrentUserRole();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f3f5f9]">
        <BottomNav />
  <TopNav
  variant={
    role === "provider"
      ? "provider"
      : role === "admin"
      ? "admin"
      : role
      ? "dashboard"
      : "public"
  }
/>
  {children}
</body>
    </html>
  );

}

