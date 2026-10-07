import type { MetadataRoute } from "next";
import { DOMEIN } from "@/lib/site";

/**
 * robots.txt — wat Yoast in WordPress automatisch doet, staat hier in code.
 * Preview (NEXT_PUBLIC_LIVE ≠ "true"): alles dicht, zodat Google de previewstand
 * met claimmarkeringen nooit indexeert. Live: alles open, met de sitemap erbij.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_LIVE !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ontwerp"] },
    sitemap: `https://${DOMEIN}/sitemap.xml`,
    host: `https://${DOMEIN}`,
  };
}
