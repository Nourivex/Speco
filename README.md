# SPECO: Sistem Pendukung Keputusan (SPK) Rekomendasi Laptop Mahasiswa

Platform Sistem Pendukung Keputusan (SPK) pemilihan laptop dan komputer ringkas berbasis profil jurusan, beban komputasi, dan batasan anggaran mahasiswa di Indonesia. Sistem memanfaatkan metode **Simple Additive Weighting (SAW)** dengan 7 matriks persona akademik dan katalog 450 data perangkat aktif yang terhubung langsung ke **Supabase Cloud**.

Dikembangkan oleh **TIM SPECO (Kelompok 7A)** untuk mata kuliah Rekayasa Perangkat Lunak (RPL), **Universitas Harkat Negeri**.

---

## 1. Ringkasan Arsitektur & Transisi Modern

Pada tahap awal perancangan, backend dirancang menggunakan PHP Laravel 12 secara terpisah (*headless*) dengan container lokal DDEV dan database MariaDB. Namun, saat memasuki fase evaluasi dan kesiapan produksi, seluruh fungsionalitas backend dialihkan secara menyeluruh ke arsitektur **Unified Next.js 16 Full-Stack & Supabase Cloud Serverless**.

### Alasan Strategis Transisi Arsitektur:
1. **Eliminasi Ketergantungan Dedicated Server & VPS Mandiri**:
   - Backend Laravel membutuhkan server mandiri atau VPS dengan konfigurasi manual tingkat sistem operasi (Nginx, PHP-FPM 8.4+, ekstensi PDO, process supervisor/supervisord, automasi SSL Certbot, serta konfigurasi port publik).
   - Menimbulkan biaya sewa server bulanan dan risiko kegagalan sistem (*downtime*) saat demonstrasi pengujian evaluasi.
   - Dengan beralih ke Next.js 16 dan Supabase Cloud, seluruh sistem (antarmuka, API bisnis, dan database) berjalan secara *serverless* (misal via Vercel / Cloudflare) dengan biaya operasional $0, ketersediaan 99.9%, dan tanpa beban perawatan server fisik.
2. **Efisiensi Latensi & Bebas Kendala CORS**:
   - Menghilangkan *round-trip latency* komunikasi lintas domain antara server frontend dan backend.
   - Tidak memerlukan pemeliharaan dua *runtime* terpisah (PHP dan Node.js).
3. **Database Terkelola dengan Skalabilitas Tinggi**:
   - Database PostgreSQL dihosting pada Supabase Cloud kawasan Asia Tenggara (`ap-southeast-1`, AWS Singapore) dengan *connection pooler* PgBouncer bawaan (port 6543).
   - Dilindungi *Row Level Security* (RLS) serta autentikasi multi-provider (Google OAuth & Passkey Otoritas).
4. **Logika Bisnis & Perhitungan SPK Native**:
   - Algoritma Simple Additive Weighting (SAW), autentikasi staf, manipulasi 20 atribut katalog, hingga *batch merge* Excel dieksekusi melalui Next.js Route Handlers (`app/api/*`) di sisi server dengan Service Role Key privat.

---

## 2. Struktur Tim Pengembang (Kelompok 7A)

| Nama Anggota | Akun GitHub | Peran Utama & Lingkup Kerja |
| :--- | :--- | :--- |
| **Muhammad Affif** | [@Nourivex](https://github.com/Nourivex) | **Project Lead & Backend/Data Engineer**<br>- Arsitektur sistem, skema database Supabase PostgreSQL, dan REST Route Handlers.<br>- Algoritma SPK SAW, kurasi dataset 450 perangkat, dan konsol portal staf (`/admin`). |
| **Zakky Fawwaz** | [@zakyfawwaz701](https://github.com/zakyfawwaz701) | **System Analyst & Koordinator Dosen Pengawas**<br>- Dokumen spesifikasi kebutuhan perangkat lunak (SRS) dan Use Case Diagram.<br>- Validasi alur fungsional sistem dan asistensi dosen pengawas. |
| **Muhamad Fahren Andrean Rangkuti** | [@Renkaslana](https://github.com/Renkaslana) | **Frontend Developer (Next.js)**<br>- Arsitektur UI App Router, Tailwind CSS, komponen interaktif, dan state management.<br>- Implementasi kuesioner wizard, kartu komparasi, dan halaman rekomendasi. |
| **Yesa Prayugo** | [@yesaprayugo](https://github.com/yesaprayugo) | **UI/UX Designer & QA Lead**<br>- Wireframe, prototipe antarmuka Figma, aset studio 3D, dan pengujian kualitas usability. |
| **Dosen Pengawas** | [@redmousestudio](https://github.com/redmousestudio) | Dosen Pengawas & Evaluator Mata Kuliah Rekayasa Perangkat Lunak |

---

## 3. Fitur Utama Aplikasi

### A. Alur Rekomendasi Mahasiswa
1. **Landing Page Interaktif (`/`)**: Menampilkan ringkasan metrik pasar, simulasi budget dinamis, transparansi sistem pembobotan, dan pratinjau katalog.
2. **Wizard Preferensi 5 Langkah (`/rekomendasi/...`)**:
   - `budget`: Input batasan anggaran fleksibel dengan preset jurusan.
   - `jurusan`: Pemilihan rumpun keilmuan akademik.
   - `aktivitas`: Identifikasi beban kerja (browsing, kompilasi kode, rendering 3D, pengolahan data).
   - `software`: Pemilihan perangkat lunak wajib (VS Code, Android Studio, AutoCAD, Blender, SPSS, dll.).
   - `prioritas`: Penentuan bobot prioritas (performa prosesor, kartu grafis, bobot portabel, kapasitas RAM, daya tahan baterai).
3. **Profil Kebutuhan Akademik (`/rekomendasi/profil`)**: Menghitung batas minimum hardware (CPU, RAM, GPU, Layar) beserta analisis rasionalitas budget.
4. **Mesin Rekomendasi SAW (`/rekomendasi/analisis` & `/rekomendasi/hasil`)**:
   - Eksekusi kalkulasi SAW realtime dengan pembobotan benefit-cost.
   - Menghasilkan predikat *Best Match*, alternatif terdekat, skor kecocokan persentase (0 - 100%), rincian kelebihan (*pros*), dan kekurangan (*cons*).
5. **Detail Spesifikasi Laptop (`/laptop/[slug]`)**: Menampilkan lembar spesifikasi komprehensif, justifikasi kecocokan jurusan, dan tautan platform pembelian resmi.
6. **Komparasi Head-to-Head (`/bandingkan?ids=...`)**: Perbandingan berdampingan 2 hingga 3 laptop dengan parameter matriks kebutuhan mahasiswa.
7. **Dashboard Mahasiswa & Riwayat (`/dashboard` & `/riwayat`)**:
   - 4 Bento Metric status rekomendasi dan pemantauan harga pasar.
   - Riwayat simulasi AI dan komparasi dual-matrix.
   - Manajemen daftar simpanan (*wishlist*) lokal.
8. **Dokumentasi Terintegrasi (`/docs`)**: Portal dokumentasi teknis sistem, petunjuk penggunaan, dan spesifikasi arsitektur.

---

### B. Portal Administrasi & Konsol Staf (`/admin`)
Konsol manajemen dataset 450 laptop dengan kapabilitas enterprise:
1. **Otorisasi Multi-Level Aman**:
   - Dukungan autentikasi Google OAuth khusus akun admin terdaftar di Supabase.
   - Autentikasi cadangan menggunakan Passkey tim yang diverifikasi langsung via database `admin_passkeys` dan server route privat.
2. **Manajemen 20 Atribut Spesifikasi**:
   - Pengelolaan menyeluruh: ID Perangkat, Brand, Model/Seri, Tipe, Kategori Target, Jurusan, CPU, GPU, RAM, Upgradability RAM, Storage SSD/eMMC, Layar & Panel, Bobot, Harga Pasar, Platform Beli, Status Garansi, UseCase Tag, Kelebihan (Pros), Kekurangan (Cons), dan URL Gambar.
3. **Tabel Data Interaktif**:
   - Fitur *horizontal mouse drag-to-scroll* (`cursor-grab` / `cursor-grabbing`) mempermudah navigasi tabel berukuran besar.
   - Kolom nama perangkat berstatus *sticky pinned* di sisi kiri sehingga identitas unit selalu terlihat saat digeser.
4. **Pratinjau Gambar Langsung (Live Image Preview)**:
   - Verifikasi URL gambar perangkat sebelum disimpan ke database.
   - Deteksi otomatis link gambar valid atau gagal muat (*fallback error handling*).
   - Tombol *Tes Link* untuk membuka gambar pada tab peramban baru.
5. **Audit Kualitas & Detektor Data Null**:
   - Kartu metrik pemantau kelengkapan: unit belum ada gambar, data belum lengkap, dan unit 100% lengkap.
   - Filter tabel instan berdasarkan status kelengkapan data.
   - Tombol unduh khusus untuk mengekspor data yang butuh perbaikan ke Excel.
6. **Ekspor & Impor Merge Excel Pintar**:
   - **Ekspor Excel (.xlsx)**: Mengunduh data katalog lengkap atau data yang sedang tersaring.
   - **Ekspor SQL (.sql)**: Menghasilkan dump skema tabel DDL dan DML insert query.
   - **Impor & Merge Excel (.xlsx)**: Mengunggah file Excel perbaikan data, menampilkan dialog pratinjau perubahan (*old value* vs *new value*), dan mengeksekusi merge secara aman ke database Supabase tanpa menimpa data yang tidak diubah.
7. **Tema Tampilan Ganda**:
   - Dukungan Mode Terang (*Light Mode*) dan Mode Gelap (*Dark Mode*) dengan penyimpanan preferensi di `localStorage`.

---

## 4. Stack Teknologi

- **Framework**: Next.js 16.4 (App Router, Turbopack, Partial Prerendering, Server Actions).
- **Runtime**: Node.js 20+.
- **Bahasa**: TypeScript 5.8+ (Strict Type Checking).
- **Styling**: Tailwind CSS v4, PostCSS, Framer Motion / Motion.
- **Komponen UI**: shadcn/ui, Radix UI Primitives, Phosphor Icons (`@phosphor-icons/react/dist/ssr/*`).
- **Database**: PostgreSQL 15+ hosted on Supabase Cloud (AWS Singapore `ap-southeast-1`).
- **Connection Pooler**: PgBouncer (Port 6543, Transaction Mode).
- **Autentikasi**: Supabase Auth (Google OAuth, JWT Session, Passkey Database Gate).
- **Pengolahan Spreadsheet**: SheetJS (`xlsx`) untuk ekspor-impor Excel.

---

## 5. Struktur Folder Repositori

```text
frontend/
├── app/
│   ├── (auth)/login/        # Halaman autentikasi staf & mahasiswa
│   ├── admin/               # Konsol manajemen staf 450 laptop
│   ├── api/                 # Next.js Serverless Route Handlers
│   │   ├── admin/
│   │   │   ├── laptops/     # Endpoint PUT/POST/DELETE katalog (Service Role)
│   │   │   ├── passkey/     # Verifikasi passkey staf dari database
│   │   │   └── verify/      # Verifikasi token JWT Google OAuth
│   │   ├── laptops/         # API publik katalog laptop
│   │   └── recommendation/  # Mesin rekomendasi SPK SAW
│   ├── bandingkan/          # Antarmuka komparasi 2-3 laptop
│   ├── dashboard/           # Dashboard analitik mahasiswa
│   ├── docs/                # Portal dokumentasi teknis sistem
│   ├── laptop/[slug]/       # Halaman spesifikasi detail laptop
│   ├── rekomendasi/         # Alur kuesioner wizard, profil, analisis, & hasil
│   ├── riwayat/             # Riwayat simulasi & wishlist mahasiswa
│   ├── layout.tsx           # Root layout HTML & metadata
│   └── page.tsx             # Landing page utama SPECO
├── components/
│   ├── compare/             # Komponen tabel komparasi
│   ├── dashboard/           # Komponen widget dashboard mahasiswa
│   ├── landing/             # Komponen landing page & nav header
│   ├── laptop/              # Komponen visual detail laptop
│   ├── results/             # Komponen kartu hasil & skor SAW
│   ├── ui/                  # Komponen atomik antarmuka (brand-icon, button, input)
│   └── wizard/              # Komponen langkah kuesioner
├── data/                    # Dataset lokal cadangan (devices-catalog.json, options.json)
├── docs/                    # Dokumentasi spesifikasi produk (PRD, BACKEND, DECISIONS)
├── lib/
│   ├── catalog-service.ts   # Layer pembaca katalog dan transformasi data
│   ├── format.ts            # Utilitas format mata uang Rupiah dan angka
│   ├── recommendation-saw.ts# Algoritma perhitungan matematis SAW
│   └── supabase.ts          # Klien koneksi Supabase & helper fungsi server API
├── public/                  # Logo brand SPECO, aset gambar webp, dan ikon
├── next.config.ts           # Konfigurasi Next.js 16
├── package.json             # Dependensi proyek
└── tsconfig.json            # Konfigurasi TypeScript compiler
```

---

## 6. Panduan Menjalankan Sistem Secara Lokal

### Prasyarat
- Node.js versi 20.x atau lebih baru.
- npm versi 10.x atau yarn / pnpm.

### 1. Kloning Repositori
```bash
git clone git@github.com:Nourivex/Speco.git
cd Speco/frontend
```

### 2. Konfigurasi Variabel Lingkungan (`.env.local`)
Buat berkas `.env.local` pada folder `frontend/` dan isi kredensial Supabase:
```env
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL="https://<project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"

# Private Server Key (Hanya diakses di server Node.js, tidak masuk bundle browser)
SPECO_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SPECO_ADMIN_PASSKEY="speco-admin-2026"
```

### 3. Pemasangan Dependensi & Menjalankan Server Dev
```bash
npm install
npm run dev
```
Aplikasi dapat diakses pada peramban melalui alamat: **`http://localhost:3000`**

### 4. Kompilasi Produksi (Production Build)
```bash
npm run build
npm run start
```
Turbopack akan mengompilasi seluruh 42 rute statis dan dinamis dengan pengecekan ketat TypeScript.

---

## 7. Skema Database Supabase (`laptops`)

Tabel utama `public.laptops` menampung seluruh entitas katalog perangkat:

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `VARCHAR(50)` (PK) | Kode unik perangkat (contoh: `LP206`, `LP356`) |
| `brand` | `VARCHAR(100)` | Merek resmi (ASUS, Lenovo, Acer, Apple, HP, Advan, dll.) |
| `model` | `VARCHAR(255)` | Nama model lengkap perangkat |
| `device_type` | `VARCHAR(50)` | Tipe perangkat: `Laptop`, `Mini PC`, atau `PC Rakitan` |
| `category` | `VARCHAR(100)` | Kategori persona target (misal: `Dasar/Pelajar`, `Teknik/Informatika`) |
| `major_target` | `TEXT` | Target rumpun jurusan perkuliahan mahasiswa |
| `cpu` | `VARCHAR(255)` | Spesifikasi prosesor |
| `gpu` | `VARCHAR(255)` | Kartu grafis terintegrasi atau diskrit |
| `is_dedicated_gpu` | `BOOLEAN` | Indikator keberadaan GPU diskrit |
| `ram_gb` | `NUMERIC` | Kapasitas RAM dasar dalam gigabyte |
| `ram_upgradable` | `BOOLEAN` | Ketersediaan slot ekspansi RAM |
| `storage` | `VARCHAR(255)` | Kapasitas dan jenis media penyimpanan (SSD NVMe / eMMC) |
| `display` | `VARCHAR(255)` | Ukuran, resolusi panel, dan color gamut layar |
| `weight_kg` | `NUMERIC` | Bobot unit perangkat dalam satuan kilogram |
| `price_idr` | `BIGINT` | Estimasi harga pasar dalam Rupiah (IDR) |
| `image_url` | `TEXT` | Tautan gambar produk resolusi tinggi |
| `buy_url` | `TEXT` | Tautan rujukan toko atau platform pembelian resmi |
| `warranty` | `VARCHAR(255)` | Masa dan status garansi resmi distributor |
| `usecase_tag` | `TEXT` | Tagar skenario penggunaan (#coding, #skripsi, #desain) |
| `pros` | `TEXT` | Rincian kelebihan perangkat |
| `cons` | `TEXT` | Catatan kekurangan atau kompromi perangkat |
| `created_at` | `TIMESTAMPTZ` | Waktu pencatatan data pertama kali |
| `updated_at` | `TIMESTAMPTZ` | Waktu pembaruan data terakhir |

---

## 8. Kebijakan Repositori & Sinkronisasi Git

Seluruh pekerjaan kode disinkronkan ke repositori resmi:
- **Repositori Utama**: **[`https://github.com/Nourivex/Speco`](https://github.com/Nourivex/Speco)** (Cabang `UI` untuk frontend & full-stack serverless, cabang `main` untuk arsip backend Laravel).
- **Repositori Anggota**: **[`https://github.com/Renkaslana/NEXORA`](https://github.com/Renkaslana/NEXORA)** (Sinkronisasi cabang `UI`).

---

<p align="center">
  <strong>TIM SPECO (Kelompok 7A)</strong><br>
  Program Studi Teknik Informatika - Fakultas Ilmu Komputer<br>
  Universitas Harkat Negeri - 2026
</p>
