import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Bump when content changes meaningfully (kept static so pages stay prerendered).
const UPDATED = "2026-11-18";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/calculator`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/privacy`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
