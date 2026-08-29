import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://get-ben.com",
      lastModified: new Date("2026-08-28"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
