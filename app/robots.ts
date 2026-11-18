import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Open to search engines AND AI answer engines (ChatGPT, Perplexity, Claude,
 * Gemini) so the business can be cited in AI answers. Remove a bot from the
 * list to opt it out.
 */
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: aiBots, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
