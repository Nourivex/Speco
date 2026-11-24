export interface PartnerStore {
  id: string;
  storeName: string;
  slug: string;
  brandFocus: string;
  storeTier: "Exclusive Brand Store" | "Authorized Campus Reseller" | "Official Brand Partner" | "Authorized Builder Partner";
  isOfficialPartner: boolean;
  city: string;
  addressInfo: string;
  storeUrl: string;
  whatsappContact?: string;
  warrantyBenefit: string;
  badgeLabel: string;
  tagline: string;
  isLocalBrand?: boolean;
}

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: "PS-LENOVO-01",
    storeName: "Lenovo Exclusive Store Indonesia",
    slug: "lenovo-exclusive-store",
    brandFocus: "Lenovo",
    storeTier: "Exclusive Brand Store",
    isOfficialPartner: true,
    city: "Jakarta, Bandung, Semarang, Surabaya",
    addressInfo: "Gerai Resmi Lenovo Exclusive Store & Authorized Campus Dealer",
    storeUrl: "https://www.lenovo.com/id/in/",
    warrantyBenefit: "Garansi Resmi Lenovo Indonesia 2-3 Tahun + Accidental Damage Protection (ADP)",
    badgeLabel: "Official Brand Partner",
    tagline: "Dealer resmi khusus lini IdeaPad, ThinkPad, Yoga, dan Legion bergaransi resmi Indonesia.",
  },
  {
    id: "PS-ASUS-01",
    storeName: "ASUS Exclusive Store & ROG Official",
    slug: "asus-exclusive-store",
    brandFocus: "ASUS",
    storeTier: "Exclusive Brand Store",
    isOfficialPartner: true,
    city: "Jakarta, Yogyakarta, Surabaya, Semarang",
    addressInfo: "ASUS Exclusive Store Indonesia & ROG Certified Center",
    storeUrl: "https://www.asus.com/id/",
    warrantyBenefit: "ASUS Perfect Warranty 2 Tahun + Garansi Global Resmi",
    badgeLabel: "Official Brand Partner",
    tagline: "Mitra resmi seri Vivobook, Zenbook OLED, TUF, dan ROG dengan layanan purna jual resmi.",
  },
  {
    id: "PS-ACER-01",
    storeName: "Acer Exclusive Store Indonesia",
    slug: "acer-exclusive-store",
    brandFocus: "Acer",
    storeTier: "Exclusive Brand Store",
    isOfficialPartner: true,
    city: "Jakarta, Bandung, Surabaya, Medan",
    addressInfo: "Acer Exclusive Store & Predator Official Partner",
    storeUrl: "https://www.acer.com/id-id/",
    warrantyBenefit: "Garansi Resmi Acer Indonesia 2-3 Tahun + Onsite Service",
    badgeLabel: "Official Brand Partner",
    tagline: "Dealer resmi Acer Aspire, Swift, dan Nitro dengan cakupan layanan servis nasional.",
  },
  {
    id: "PS-APPLE-01",
    storeName: "Apple Authorized Campus Reseller",
    slug: "apple-authorized-campus-reseller",
    brandFocus: "Apple",
    storeTier: "Authorized Campus Reseller",
    isOfficialPartner: true,
    city: "Jakarta, Bandung, Surabaya, Bali",
    addressInfo: "Distributor Resmi Apple Education Indonesia (iBox / Digimap)",
    storeUrl: "https://www.apple.com/id/education/",
    warrantyBenefit: "Garansi Resmi Apple Indonesia 1 Tahun + Harga Edukasi Mahasiswa",
    badgeLabel: "Official Brand Partner",
    tagline: "Mitra resmi ekosistem MacBook Air, MacBook Pro, dan Mac Mini bergaransi resmi.",
  },
  {
    id: "PS-HP-01",
    storeName: "HP Official Store Indonesia",
    slug: "hp-official-store",
    brandFocus: "HP",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta, Tangerang, Surabaya",
    addressInfo: "HP Store Resmi & OMEN Gaming Authorized Partner",
    storeUrl: "https://www.hp.com/id-id/",
    warrantyBenefit: "Garansi Resmi HP Indonesia 2 Tahun + Onsite Support",
    badgeLabel: "Official Brand Partner",
    tagline: "Penyalur resmi lini HP Pavilion, Victus, Aero, dan Envy untuk kebutuhan akademik.",
  },
  {
    id: "PS-MSI-01",
    storeName: "MSI Official Store Indonesia",
    slug: "msi-official-store",
    brandFocus: "MSI",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta, Bandung, Surabaya",
    addressInfo: "MSI Concept Store & Authorized Gaming Center Indonesia",
    storeUrl: "https://id.msi.com/",
    warrantyBenefit: "Garansi Resmi MSI Indonesia 2 Tahun",
    badgeLabel: "Official Brand Partner",
    tagline: "Toko mitra resmi MSI Modern, Prestige, dan seri GPU diskrit untuk teknik serta kreator.",
  },
  {
    id: "PS-DELL-01",
    storeName: "Dell Exclusive Store Indonesia",
    slug: "dell-exclusive-store",
    brandFocus: "Dell",
    storeTier: "Exclusive Brand Store",
    isOfficialPartner: true,
    city: "Jakarta, Surabaya, Bandung",
    addressInfo: "Dell Exclusive Partner & ProSupport Authorized Dealer",
    storeUrl: "https://www.dell.com/id-id",
    warrantyBenefit: "Dell ProSupport Resmi 1-3 Tahun Onsite",
    badgeLabel: "Official Brand Partner",
    tagline: "Dealer resmi Dell Inspiron, Vostro, dan Latitude dengan dukungan ProSupport kampus.",
  },
  {
    id: "PS-AXIOO-01",
    storeName: "Axioo Official Partner Store",
    slug: "axioo-official-partner-store",
    brandFocus: "Axioo",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta, Semarang, Tegal, Surabaya",
    addressInfo: "Axioo Care Platinum & Mitra Kampus Indonesia",
    storeUrl: "https://axiooworld.com/",
    warrantyBenefit: "Garansi Resmi Axioo Care Indonesia + ADP 1 Tahun",
    badgeLabel: "Official Brand Partner",
    tagline: "Mitra resmi brand lokal Axioo untuk seri Hype dan Pongo dengan perlindungan ADP.",
    isLocalBrand: true,
  },
  {
    id: "PS-ADVAN-01",
    storeName: "Advan Official Store Indonesia",
    slug: "advan-official-store",
    brandFocus: "Advan",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta, Semarang, Surabaya",
    addressInfo: "Advan Official Brand Store & Service Center Nasional",
    storeUrl: "https://www.advan.id/",
    warrantyBenefit: "Garansi Resmi Advan Indonesia 1 Tahun + Service Center Nasional",
    badgeLabel: "Official Brand Partner",
    tagline: "Toko resmi Advan Indonesia untuk seri Workplus dan Workpro bernilai performa tinggi.",
    isLocalBrand: true,
  },
  {
    id: "PS-ZYREX-01",
    storeName: "Zyrex Official Store Indonesia",
    slug: "zyrex-official-store",
    brandFocus: "Zyrex",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta, Bandung, Semarang",
    addressInfo: "Zyrex Flagship Partner & Education Dealer",
    storeUrl: "https://zyrex.com/",
    warrantyBenefit: "Garansi Resmi Zyrex Indonesia 1 Tahun",
    badgeLabel: "Official Brand Partner",
    tagline: "Distributor resmi produk lokal Zyrex untuk kebutuhan pelajar dan mahasiswa Indonesia.",
    isLocalBrand: true,
  },
  {
    id: "PS-INFINIX-01",
    storeName: "Infinix Official Store Indonesia",
    slug: "infinix-official-store",
    brandFocus: "Infinix",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta & Nasional",
    addressInfo: "Infinix Flagship Store & Carlcare Service Center",
    storeUrl: "https://id.infinixmobility.com/",
    warrantyBenefit: "Garansi Resmi Infinix Indonesia 1-2 Tahun (Carlcare)",
    badgeLabel: "Official Brand Partner",
    tagline: "Mitra resmi seri INBook yang portabel dengan harga terjangkau mahasiswa.",
  },
  {
    id: "PS-MINISFORUM-01",
    storeName: "Minisforum Authorized Indonesia",
    slug: "minisforum-authorized-indonesia",
    brandFocus: "MINISFORUM",
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta & Nasional",
    addressInfo: "Distributor Resmi Mini PC Workstation Indonesia",
    storeUrl: "https://store.minisforum.com/",
    warrantyBenefit: "Garansi Distributor Resmi Indonesia 1-2 Tahun",
    badgeLabel: "Official Brand Partner",
    tagline: "Mitra resmi Mini PC ringkas berkinerja desktop untuk kamar kos mahasiswa.",
  },
  {
    id: "PS-CUSTOM-01",
    storeName: "Mitra Rakit PC Kampus Official",
    slug: "mitra-rakit-pc-kampus",
    brandFocus: "Custom",
    storeTier: "Authorized Builder Partner",
    isOfficialPartner: true,
    city: "Jakarta, Bandung, Yogyakarta, Surabaya",
    addressInfo: "Partner Perakitan PC Resmi Bergaransi Komponen Distributor",
    storeUrl: "https://www.tokopedia.com/",
    warrantyBenefit: "Garansi Resmi Distributor Tiap Komponen 2-3 Tahun + Jasa Rakit Teruji",
    badgeLabel: "Official Brand Partner",
    tagline: "Mitra perakitan PC hemat bergaransi resmi komponen untuk beban komputasi berat.",
  },
];

/**
 * Mengambil seluruh daftar toko mitra resmi brand.
 */
export function getAllPartnerStores(): PartnerStore[] {
  return PARTNER_STORES;
}

/**
 * Mencari toko mitra berdasarkan ID toko (misal PS-LENOVO-01).
 */
export function getPartnerStoreById(id?: string | null): PartnerStore | undefined {
  if (!id) return undefined;
  return PARTNER_STORES.find((store) => store.id.toLowerCase() === id.trim().toLowerCase());
}

/**
 * Memetakan brand laptop ke identitas toko mitra resminya.
 * Mendukung merek global, lokal Indonesia, serta fallback deterministik untuk brand khusus.
 */
export function getPartnerStoreByBrand(brand: string, partnerStoreId?: string | null): PartnerStore {
  if (partnerStoreId) {
    const byId = getPartnerStoreById(partnerStoreId);
    if (byId) return byId;
  }

  const normalized = (brand || "").trim().toLowerCase();
  const matched = PARTNER_STORES.find(
    (store) => store.brandFocus.toLowerCase() === normalized || store.slug.toLowerCase() === normalized
  );
  if (matched) return matched;

  const cleanBrand = (brand || "SPECO").trim();
  const slugBrand = cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: `PS-${cleanBrand.toUpperCase().replace(/[^A-Z0-9]+/g, "")}-01`,
    storeName: `${cleanBrand} Official Partner Store`,
    slug: `${slugBrand}-official-store`,
    brandFocus: cleanBrand,
    storeTier: "Official Brand Partner",
    isOfficialPartner: true,
    city: "Jakarta & Nasional",
    addressInfo: `Dealer Resmi ${cleanBrand} Indonesia`,
    storeUrl: `https://www.tokopedia.com/search?q=${encodeURIComponent(`${cleanBrand} Official Store`)}`,
    warrantyBenefit: `Garansi Resmi ${cleanBrand} Indonesia`,
    badgeLabel: "Official Brand Partner",
    tagline: `Mitra penjualan resmi perangkat ${cleanBrand} bergaransi distributor Indonesia.`,
  };
}
