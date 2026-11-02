import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// PRD §22: Plus Jakarta Sans untuk heading & body, JetBrains Mono untuk angka spek/skor
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://speco.nour.web.id"),
  title: {
    default: "SPECO : Sistem Pendukung Keputusan (SPK) Rekomendasi Laptop Mahasiswa",
    template: "%s | SPECO",
  },
  description:
    "Platform Sistem Pendukung Keputusan (SPK) pemilihan laptop dan komputer ringkas berbasis profil jurusan, beban komputasi, dan batasan anggaran mahasiswa di Indonesia menggunakan metode Simple Additive Weighting (SAW).",
  applicationName: "SPECO",
  keywords: [
    "rekomendasi laptop",
    "spk saw",
    "laptop mahasiswa",
    "speco",
    "komparasi laptop",
    "rekayasa perangkat lunak",
    "universitas harkat negeri",
    "laptop coding informatika",
    "laptop dkv desain",
    "laptop teknik mesin",
    "pc rakitan mahasiswa",
    "supabase cloud",
  ],
  authors: [{ name: "Muhammad Affif & TIM SPECO (Kelompok 7A)", url: "https://speco.nour.web.id" }],
  creator: "Muhammad Affif",
  publisher: "Universitas Harkat Negeri",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://speco.nour.web.id",
    siteName: "SPECO Indonesia",
    title: "SPECO : Platform Rekomendasi Laptop Mahasiswa Berbasis SPK SAW",
    description:
      "Temukan laptop paling ideal sesuai jurusan dan anggaranmu dari katalog 450 perangkat aktif dengan transparansi algoritma SAW.",
    images: [
      {
        url: "/brand/speco-logo.png",
        width: 1200,
        height: 630,
        alt: "SPECO - Sistem Pendukung Keputusan Rekomendasi Laptop Mahasiswa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPECO : Platform Rekomendasi Laptop Mahasiswa",
    description:
      "Platform rekomendasi laptop berbasis data dan algoritma SAW untuk mahasiswa Indonesia.",
    images: ["/brand/speco-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://speco.nour.web.id/#webapp",
      name: "SPECO - Sistem Pendukung Keputusan Rekomendasi Laptop Mahasiswa",
      url: "https://speco.nour.web.id",
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      description:
        "Platform Sistem Pendukung Keputusan (SPK) pemilihan laptop dan komputer ringkas berbasis metode Simple Additive Weighting (SAW) dan katalog 450 perangkat terhubung ke Supabase Cloud.",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
      },
      author: {
        "@type": "Organization",
        name: "TIM SPECO (Kelompok 7A) - Universitas Harkat Negeri",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://speco.nour.web.id/#website",
      url: "https://speco.nour.web.id",
      name: "SPECO",
      description: "Rekomendasi laptop pintar mahasiswa berbasis algoritma SAW",
      publisher: {
        "@type": "Organization",
        name: "Universitas Harkat Negeri",
      },
      inLanguage: "id-ID",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${jetbrains.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
