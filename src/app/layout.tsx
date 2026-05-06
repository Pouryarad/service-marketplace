import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/nav";
import { getCurrentUserRole, getProviderRequests } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import type { ProviderRequest } from "@/lib/types";

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
  const providerRequests: ProviderRequest[] =
    role === "provider" ? await getProviderRequests() : [];

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f3f5f9]">
        <BottomNav
          variant={
            !role
              ? "public"
              : role === "provider"
                ? "provider"
                : "dashboard"
          }
          providerRequests={providerRequests}
        />
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
          providerRequests={providerRequests}
        />
        {children}
      </body>
    </html>
  );
}