import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://get-ben.com/sitemap.xml",
    host: "https://get-ben.com",
  };
}
