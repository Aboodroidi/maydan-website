import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

// Winco (the brand face) is self-hosted via @font-face in globals.css.
// Cairo covers Arabic, where Winco has no glyphs.
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maydan.om"),
  title: "Maydan — Book football pitches in Muscat",
  description:
    "Maydan is the easiest way to discover and book football pitches across Muscat, Oman. Coming soon to iPhone.",
  icons: { icon: "/assets/img/app-icon.png" },
  openGraph: {
    title: "Maydan — Book football pitches in Muscat",
    description: "Discover and book football pitches across Muscat, Oman. Coming soon to iPhone.",
    url: "https://www.maydan.om",
    siteName: "Maydan",
    locale: "en_OM",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={cairo.variable}>
      <body>
        <div className="ambient" />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
