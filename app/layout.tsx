import type { Metadata } from "next";
import "./globals.css";

const canonicalUrl = "https://get-ben.com";
const title = "Ben Huffman — Founder & CEO of Contra | Contra Labs";
const description = "Ben Huffman is the founder and CEO of Contra and founder of Contra Labs, building products and research for the future of creative work.";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title,
  description,
  applicationName: "Ben Huffman",
  authors: [{ name: "Ben Huffman", url: canonicalUrl }],
  creator: "Ben Huffman",
  publisher: "Ben Huffman",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: canonicalUrl,
    siteName: "Ben Huffman",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ben Huffman — Founder and CEO of Contra, founder of Contra Labs" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@contraben",
    images: ["/og.png"],
  },
};

const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${canonicalUrl}/#profile`,
  url: canonicalUrl,
  name: title,
  description,
  mainEntity: {
    "@type": "Person",
    "@id": `${canonicalUrl}/#ben-huffman`,
    name: "Ben Huffman",
    alternateName: ["@contraben"],
    url: canonicalUrl,
    image: `${canonicalUrl}/images/ben-headshot.jpeg`,
    jobTitle: "Founder and CEO",
    description,
    sameAs: [
      "https://x.com/contraben",
      "https://www.linkedin.com/in/ben-huffman-b7b6a8102/",
      "https://contra.com/ben",
    ],
    worksFor: [
      {
        "@type": "Organization",
        "@id": "https://contra.com/#organization",
        name: "Contra",
        url: "https://contra.com/",
      },
      {
        "@type": "Organization",
        "@id": "https://contralabs.com/#organization",
        name: "Contra Labs",
        url: "https://contralabs.com/",
      },
    ],
    knowsAbout: [
      "Contra",
      "Contra Labs",
      "Creative AI",
      "AI evaluation",
      "Independent work",
      "Creative research",
      "Angel investing",
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />{children}</body></html>;
}
