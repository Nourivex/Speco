import { NextRequest, NextResponse } from "next/server";
import rawCatalog from "@/data/devices-catalog.json";
import { getPartnerStoreByBrand } from "@/lib/partner-stores";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand")?.toLowerCase();
  const partnerStoreParam = searchParams.get("partnerStore")?.toLowerCase();
  const search = searchParams.get("search")?.toLowerCase();
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

  let filtered = (rawCatalog as any[]) || [];

  if (brand && brand !== "all") {
    filtered = filtered.filter((d) => (d.Brand || "").toLowerCase().includes(brand));
  }

  if (partnerStoreParam && partnerStoreParam !== "all") {
    filtered = filtered.filter((d) => {
      const store = getPartnerStoreByBrand(d.Brand || "");
      return (
        store.id.toLowerCase() === partnerStoreParam ||
        store.slug.toLowerCase() === partnerStoreParam ||
        store.brandFocus.toLowerCase() === partnerStoreParam
      );
    });
  }

  if (search) {
    filtered = filtered.filter(
      (d) =>
        (d.Model_Seri || "").toLowerCase().includes(search) ||
        (d.Brand || "").toLowerCase().includes(search) ||
        (d.Processor_CPU || "").toLowerCase().includes(search) ||
        (d.Kartu_Grafis_GPU || "").toLowerCase().includes(search)
    );
  }

  if (maxPrice) {
    filtered = filtered.filter((d) => (parseFloat(d.Estimasi_Harga_Pasar_IDR) || 0) <= maxPrice);
  }

  if (minPrice) {
    filtered = filtered.filter((d) => (parseFloat(d.Estimasi_Harga_Pasar_IDR) || 0) >= minPrice);
  }

  const enriched = filtered.slice(0, limit).map((d) => {
    const partnerStore = getPartnerStoreByBrand(d.Brand || "");
    return {
      ...d,
      partner_store_id: partnerStore.id,
      is_official_brand_partner: partnerStore.isOfficialPartner,
      partner_store: partnerStore,
    };
  });

  return NextResponse.json({
    success: true,
    status_code: 200,
    message: "Katalog laptop berhasil dimuat",
    data: enriched,
    meta: {
      total: filtered.length,
      limit,
      system_name: process.env.NEXT_PUBLIC_BRAND_NAME || "SPECO",
      timestamp: new Date().toISOString(),
    },
  });
}
