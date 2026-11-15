import type { MetadataRoute } from "next";
import { markets } from "@/data/markets";
import { sitemapEntries } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(markets);
}
