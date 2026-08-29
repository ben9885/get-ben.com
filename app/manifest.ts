import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ben Huffman — Founder & CEO of Contra",
    short_name: "Ben Huffman",
    description: "The personal website of Ben Huffman, founder and CEO of Contra and founder of Contra Labs.",
    start_url: "/",
    display: "standalone",
    background_color: "#1261ee",
    theme_color: "#1261ee",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
