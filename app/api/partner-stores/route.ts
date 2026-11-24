import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAllPartnerStores, getPartnerStoreByBrand, PartnerStore } from "@/lib/partner-stores";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URL ||
  "https://jirpzpqnrnzcsgiecogm.supabase.co";

const supabaseKey =
  process.env.SPECO_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabaseClient =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

function mapDbRowToPartnerStore(row: Record<string, any>): PartnerStore {
  return {
    id: row.id,
    storeName: row.store_name,
    slug: row.slug,
    brandFocus: row.brand_focus,
    storeTier: row.store_tier || "Official Brand Partner",
    isOfficialPartner: Boolean(row.is_official_partner ?? true),
    city: row.city || "Jakarta & Nasional",
    addressInfo: row.address_info || "",
    storeUrl: row.store_url || "",
    whatsappContact: row.whatsapp_contact || undefined,
    warrantyBenefit: row.warranty_benefit || "Garansi Resmi Indonesia",
    badgeLabel: row.badge_label || "Official Brand Partner",
    tagline: `Mitra resmi perangkat ${row.brand_focus} bergaransi distributor Indonesia.`,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand")?.trim();

  let stores: PartnerStore[] = [];
  let source = "catalog_config";

  if (supabaseClient) {
    try {
      let query = supabaseClient
        .from("partner_stores")
        .select("*")
        .eq("is_active", true)
        .order("store_name", { ascending: true });

      if (brand && brand.toLowerCase() !== "all") {
        query = query.ilike("brand_focus", brand);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        stores = data.map(mapDbRowToPartnerStore);
        source = "supabase_cloud";
      }
    } catch {
      // Fallback ke daftar partner stores statis apabila tabel belum dimigrasi
    }
  }

  if (stores.length === 0) {
    if (brand && brand.toLowerCase() !== "all") {
      stores = [getPartnerStoreByBrand(brand)];
    } else {
      stores = getAllPartnerStores();
    }
  }

  return NextResponse.json({
    success: true,
    status_code: 200,
    message: "Daftar toko mitra brand resmi berhasil dimuat",
    data: stores,
    meta: {
      total: stores.length,
      source,
      system_name: process.env.NEXT_PUBLIC_BRAND_NAME || "SPECO",
      timestamp: new Date().toISOString(),
    },
  });
}
