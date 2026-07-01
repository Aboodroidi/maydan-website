import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

const icon =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%232f6bff'/><text x='50' y='72' font-size='64' font-family='Arial' font-weight='bold' fill='white' text-anchor='middle'>M</text></svg>";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maydan.om"),
  title: "Maydan — Book football pitches in Muscat",
  description:
    "Maydan is the easiest way to discover and book football pitches across Muscat, Oman. Coming soon to iPhone.",
  icons: { icon },
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
    <html lang="en" dir="ltr" className={`${inter.variable} ${cairo.variable}`}>
      <body>
        <div className="ambient" />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
