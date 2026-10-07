import type { MetadataRoute } from "next";
import { DOMEIN } from "@/lib/site";

/**
 * sitemap.xml. Alleen pagina's die geïndexeerd mogen worden: de homepage.
 * De privacyverklaring staat bewust op noindex en hoort er dus niet in.
 * Komt er een pagina bij die in Google moet, voeg hem hier toe.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `https://${DOMEIN}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
