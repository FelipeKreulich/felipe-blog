import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/admin", "/profile", "/signin", "/signup", "/newsletter", "/api"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [...privatePaths, ...privatePaths.map((p) => `/en${p}`)] }],
    sitemap: absolute("/sitemap.xml"),
  };
}
