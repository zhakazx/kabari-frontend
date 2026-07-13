import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://kabari.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/invite/", "/login", "/register"],
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/kreator",
          "/gate",
          "/events",
          "/orders",
          "/notifications",
          "/primitives",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
