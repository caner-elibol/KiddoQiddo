import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KiddoQiddo — Turn Daily Tasks Into Family Wins",
  description: "Family task management and reward system for modern families",
};

export const viewport = {
  // Required for safe-area-inset CSS variables to work on iOS/Android
  themeColor: "#5B5FF8",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-white dark:bg-slate-950 font-[var(--font-inter)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
