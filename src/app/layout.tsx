import type { Metadata, Viewport } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NomiProvider } from "@/lib/store/nomiStore";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nomi — Money between friends, without the awkwardness.",
  description: "Minimal Futuristic Lavender Tech expense-sharing application. Settle up, track shared balances, equal, exact, percentage and share splits with absolute financial clarity.",
  keywords: ["expense sharing", "split bills", "nomi", "fintech", "debt simplification"],
  authors: [{ name: "Bhumik" }],
};

export const viewport: Viewport = {
  themeColor: "#7C5CFC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${poppins.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-nomi-bg text-nomi-main selection:bg-[#7C5CFC]/20 selection:text-[#7C5CFC]">
        <NomiProvider>
          {children}
        </NomiProvider>
      </body>
    </html>
  );
}
