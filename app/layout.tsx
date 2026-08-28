import type { Metadata } from "next";
import "@fontsource-variable/newsreader/wght.css";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://get-ben.com"),
  title: "Ben Huffman — Founder, Creative Director & Investor",
  description: "The personal internet homepage of Ben Huffman: founder, creative director, AI researcher, musician, and angel investor.",
  openGraph: {
    title: "Ben Huffman",
    description: "Founder × Creative Director × Researcher × Musician",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ben Huffman — Founder, Creative Director, Researcher, Musician" }],
  },
  twitter: { card: "summary_large_image", title: "Ben Huffman", description: "Founder × Creative Director × Researcher × Musician", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
