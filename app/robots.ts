import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://speco.nour.web.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/rekomendasi",
          "/rekomendasi/*",
          "/bandingkan",
          "/dashboard",
          "/docs",
          "/laptop/*",
          "/login",
          "/daftar",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin/*",
          "/dev",
          "/dev/*",
          "/_next/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin/*",
          "/dev",
          "/dev/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
