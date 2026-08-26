import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "CreatorPulse", description: "AI YouTube Growth", manifest: "/manifest.json" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider><html lang="en"><body className={inter.className}>{children}<Toaster richColors position="top-right" /></body></html></ClerkProvider>
  );
}
