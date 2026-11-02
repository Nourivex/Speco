import type { MetadataRoute } from "next";
import { laptops } from "@/data/laptops";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://speco.nour.web.id";
  const now = new Date();

  // Rute utama aplikasi publik
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rekomendasi/budget`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/rekomendasi/jurusan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bandingkan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/daftar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Rute halaman detail spesifikasi tiap laptop
  const laptopRoutes: MetadataRoute.Sitemap = laptops.map((laptop) => ({
    url: `${baseUrl}/laptop/${laptop.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...coreRoutes, ...laptopRoutes];
}
