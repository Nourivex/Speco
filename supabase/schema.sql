-- ==============================================================================
-- SPECO SUPABASE SCHEMA MIGRATION
-- Database: PostgreSQL (Supabase Cloud)
-- Proyek: SPECO - Laptop & Computer Advisor Mahasiswa
-- ==============================================================================

-- 1. Buat Tabel Utama: laptops (Katalog 450 Perangkat Laptop & Mini PC)
CREATE TABLE IF NOT EXISTS public.laptops (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    series TEXT,
    category TEXT NOT NULL,
    major_target TEXT,
    device_type TEXT DEFAULT 'Laptop',
    cpu TEXT NOT NULL,
    gpu TEXT NOT NULL,
    is_dedicated_gpu BOOLEAN DEFAULT false,
    ram_gb NUMERIC(5,1) NOT NULL DEFAULT 8.0,
    ram_upgradable BOOLEAN DEFAULT false,
    storage TEXT NOT NULL,
    display TEXT,
    weight_kg NUMERIC(4,2) DEFAULT 1.40,
    price_idr BIGINT NOT NULL,
    image_url TEXT,
    buy_url TEXT,
    warranty TEXT,
    usecase_tag TEXT,
    pros TEXT,
    cons TEXT,
    partner_store_id TEXT,
    is_official_brand_partner BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1b. Tabel Mitra Toko Resmi Brand (Partner Stores / Exclusive Dealer)
CREATE TABLE IF NOT EXISTS public.partner_stores (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand_focus TEXT NOT NULL,
    store_tier TEXT NOT NULL DEFAULT 'Official Brand Partner',
    is_official_partner BOOLEAN DEFAULT true,
    city TEXT DEFAULT 'Jakarta & Nasional',
    address_info TEXT,
    store_url TEXT,
    whatsapp_contact TEXT,
    warranty_benefit TEXT,
    badge_label TEXT DEFAULT 'Official Brand Partner',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pastikan kolom device_type & relasi partner_store_id tersedia
ALTER TABLE public.laptops ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'Laptop';
ALTER TABLE public.laptops ADD COLUMN IF NOT EXISTS partner_store_id TEXT REFERENCES public.partner_stores(id) ON DELETE SET NULL;
ALTER TABLE public.laptops ADD COLUMN IF NOT EXISTS is_official_brand_partner BOOLEAN DEFAULT true;

-- 2. Indeks untuk Query Pencarian & Filter Cepat
CREATE INDEX IF NOT EXISTS idx_laptops_brand ON public.laptops (brand);
CREATE INDEX IF NOT EXISTS idx_laptops_price ON public.laptops (price_idr);
CREATE INDEX IF NOT EXISTS idx_laptops_device_type ON public.laptops (device_type);
CREATE INDEX IF NOT EXISTS idx_laptops_partner_store ON public.laptops (partner_store_id);
CREATE INDEX IF NOT EXISTS idx_partner_stores_brand ON public.partner_stores (brand_focus);

-- Seed Data Awal Toko Mitra Resmi Brand (termasuk Lenovo Exclusive Store)
INSERT INTO public.partner_stores (id, store_name, slug, brand_focus, store_tier, is_official_partner, city, address_info, store_url, warranty_benefit, badge_label, is_active)
VALUES
    ('PS-LENOVO-01', 'Lenovo Exclusive Store Indonesia', 'lenovo-exclusive-store', 'Lenovo', 'Exclusive Brand Store', true, 'Jakarta, Bandung, Semarang, Surabaya', 'Gerai Resmi Lenovo Exclusive Store & Authorized Campus Dealer', 'https://www.lenovo.com/id/in/', 'Garansi Resmi Lenovo Indonesia 2-3 Tahun + Accidental Damage Protection (ADP)', 'Official Brand Partner', true),
    ('PS-ASUS-01', 'ASUS Exclusive Store & ROG Official', 'asus-exclusive-store', 'ASUS', 'Exclusive Brand Store', true, 'Jakarta, Yogyakarta, Surabaya, Semarang', 'ASUS Exclusive Store Indonesia & ROG Certified Center', 'https://www.asus.com/id/', 'ASUS Perfect Warranty 2 Tahun + Garansi Global Resmi', 'Official Brand Partner', true),
    ('PS-ACER-01', 'Acer Exclusive Store Indonesia', 'acer-exclusive-store', 'Acer', 'Exclusive Brand Store', true, 'Jakarta, Bandung, Surabaya, Medan', 'Acer Exclusive Store & Predator Official Partner', 'https://www.acer.com/id-id/', 'Garansi Resmi Acer Indonesia 2-3 Tahun + Onsite Service', 'Official Brand Partner', true),
    ('PS-APPLE-01', 'Apple Authorized Campus Reseller', 'apple-authorized-campus-reseller', 'Apple', 'Authorized Campus Reseller', true, 'Jakarta, Bandung, Surabaya, Bali', 'Distributor Resmi Apple Education Indonesia (iBox / Digimap)', 'https://www.apple.com/id/education/', 'Garansi Resmi Apple Indonesia 1 Tahun + Harga Edukasi Mahasiswa', 'Official Brand Partner', true),
    ('PS-HP-01', 'HP Official Store Indonesia', 'hp-official-store', 'HP', 'Official Brand Partner', true, 'Jakarta, Tangerang, Surabaya', 'HP Store Resmi & OMEN Gaming Authorized Partner', 'https://www.hp.com/id-id/', 'Garansi Resmi HP Indonesia 2 Tahun + Onsite Support', 'Official Brand Partner', true),
    ('PS-MSI-01', 'MSI Official Store Indonesia', 'msi-official-store', 'MSI', 'Official Brand Partner', true, 'Jakarta, Bandung, Surabaya', 'MSI Concept Store & Authorized Gaming Center Indonesia', 'https://id.msi.com/', 'Garansi Resmi MSI Indonesia 2 Tahun', 'Official Brand Partner', true),
    ('PS-DELL-01', 'Dell Exclusive Store Indonesia', 'dell-exclusive-store', 'Dell', 'Exclusive Brand Store', true, 'Jakarta, Surabaya, Bandung', 'Dell Exclusive Partner & ProSupport Authorized Dealer', 'https://www.dell.com/id-id', 'Dell ProSupport Resmi 1-3 Tahun Onsite', 'Official Brand Partner', true),
    ('PS-AXIOO-01', 'Axioo Official Partner Store', 'axioo-official-partner-store', 'Axioo', 'Official Brand Partner', true, 'Jakarta, Semarang, Tegal, Surabaya', 'Axioo Care Platinum & Mitra Kampus Indonesia', 'https://axiooworld.com/', 'Garansi Resmi Axioo Care Indonesia + ADP 1 Tahun', 'Official Brand Partner', true),
    ('PS-ADVAN-01', 'Advan Official Store Indonesia', 'advan-official-store', 'Advan', 'Official Brand Partner', true, 'Jakarta, Semarang, Surabaya', 'Advan Official Brand Store & Service Center Nasional', 'https://www.advan.id/', 'Garansi Resmi Advan Indonesia 1 Tahun + Service Center Nasional', 'Official Brand Partner', true),
    ('PS-ZYREX-01', 'Zyrex Official Store Indonesia', 'zyrex-official-store', 'Zyrex', 'Official Brand Partner', true, 'Jakarta, Bandung, Semarang', 'Zyrex Flagship Partner & Education Dealer', 'https://zyrex.com/', 'Garansi Resmi Zyrex Indonesia 1 Tahun', 'Official Brand Partner', true)
ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    brand_focus = EXCLUDED.brand_focus,
    store_tier = EXCLUDED.store_tier,
    warranty_benefit = EXCLUDED.warranty_benefit,
    badge_label = EXCLUDED.badge_label,
    updated_at = now();

-- Tautkan otomatis katalog laptops ke toko mitra resmi berdasarkan brand
UPDATE public.laptops l
SET partner_store_id = ps.id,
    is_official_brand_partner = true
FROM public.partner_stores ps
WHERE LOWER(l.brand) = LOWER(ps.brand_focus)
  AND l.partner_store_id IS NULL;

-- Aktifkan RLS pada partner_stores
ALTER TABLE public.partner_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca toko mitra resmi" ON public.partner_stores;
CREATE POLICY "Izinkan publik membaca toko mitra resmi"
ON public.partner_stores
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Hanya admin terotentikasi yang boleh mengubah toko mitra" ON public.partner_stores;
CREATE POLICY "Hanya admin terotentikasi yang boleh mengubah toko mitra"
ON public.partner_stores
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. Aktifkan Row Level Security (RLS) pada laptops
ALTER TABLE public.laptops ENABLE ROW LEVEL SECURITY;

-- Publik BACA SAJA seluruh katalog
DROP POLICY IF EXISTS "Izinkan publik membaca katalog laptop" ON public.laptops;
CREATE POLICY "Izinkan publik membaca katalog laptop"
ON public.laptops
FOR SELECT
TO public
USING (true);

-- Hanya admin terotentikasi yang boleh memodifikasi (Insert, Update, Delete)
DROP POLICY IF EXISTS "Izinkan admin mengelola katalog laptop" ON public.laptops;
DROP POLICY IF EXISTS "Hanya admin terotentikasi yang boleh mengubah data laptop" ON public.laptops;
CREATE POLICY "Hanya admin terotentikasi yang boleh mengubah data laptop"
ON public.laptops
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4. Tabel Khusus: admin_users (Daftar Akun Otoritas Admin)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Pengguna terotentikasi hanya dapat membaca status admin miliknya sendiri
DROP POLICY IF EXISTS "User hanya bisa baca status admin sendiri" ON public.admin_users;
CREATE POLICY "User hanya bisa baca status admin sendiri"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Tabel Khusus: admin_passkeys (Tersimpan Privat - Hanya diakses Server-Side via Service Role)
CREATE TABLE IF NOT EXISTS public.admin_passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passkey TEXT NOT NULL,
    label TEXT DEFAULT 'Passkey Otoritas',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_passkeys ENABLE ROW LEVEL SECURITY;
-- Catatan: Tabel admin_passkeys tidak memiliki policy untuk anon/public.
-- Verifikasi hanya dilakukan secara privat di server (Next.js API route) menggunakan Service Role Key.

-- 6. Tabel Pendukung: bookmarks (Simpan Laptop Favorit Mahasiswa)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    laptop_id TEXT REFERENCES public.laptops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks (user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pengguna dapat mengelola bookmark sendiri" ON public.bookmarks;
CREATE POLICY "Pengguna dapat mengelola bookmark sendiri"
ON public.bookmarks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
