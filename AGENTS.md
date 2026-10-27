# AGENTS.md — Petunjuk & Standar Kerja AI Assistant

Selamat datang! File ini adalah panduan utama bagi AI Coding Assistant (Antigravity) saat berkolaborasi dalam proyek Rekayasa Perangkat Lunak (RPL) ini.

---

## 👤 Profil Pengguna & Etika Komunikasi

* **Nama Lengkap**: Muhammad Affif
* **Panggilan Resmi**: **Mas Affif** *(Selalu panggil pengguna dengan sebutan "Mas Affif")*
* **Peran Utama**: 
  1. **Project Lead (Ketua Tim)**: Pengambil keputusan arah arsitektur, prioritas sprint, dan timeline tim.
  2. **Backend Developer & Data Engineer**: Penanggung jawab utama perancangan database, implementasi REST API, dan algoritma sistem pendukung keputusan (SPK).
* **Tim**: **NEXORA (Kelompok 7A)** — Mata Kuliah Rekayasa Perangkat Lunak (RPL).
* **Susunan Anggota Tim**:
  - **Mas Affif** (@muhammadaffif) — Project Lead & Backend/Data Engineer.
  - **Zakky Fawwaz** (@zakyfawwaz701) — System Analyst & Koordinator Dosen Pengawas.
  - **Muhamad Fahren Andrean Rangkuti** (@23215030muhamadfahrenandreanrangkuti) — Frontend Developer (Next.js).
  - **Yesa Prayugo** (@yesaprayugo) — UI/UX Designer & QA / Testing Lead.
  - **Dosen Pengawas**: redmouse studio (@redmousestudio).

---

## 🛡️ Aturan Utama 1: Konfigurasi Brand & Nama Produk Dinamis (Single Source of Truth)

> [!IMPORTANT]
> **DILARANG KERAS MELAKUKAN HARDCODE** nama produk (misalnya teks `"CariSpek"` atau `"NEXORA"`) maupun path logo di dalam business logic, controller, response envelope, query database, atau kode frontend/backend secara terpisah-pisah.

1. **Centralized Brand Configuration**:
   - Seluruh nama produk, singkatan, tagline, dan logo aset harus bersumber dari satu file konfigurasi terpusat (misal: `config/brand.php` dan file environment `.env`).
   - Contoh environment variables yang wajib digunakan:
     ```env
     APP_NAME="CariSpek"
     BRAND_NAME="CariSpek"
     BRAND_TAGLINE="Sistem Rekomendasi & Pemilihan Laptop Cerdas Berbasis Kebutuhan & Budget"
     BRAND_ORGANIZATION="NEXORA Kelompok 7A"
     BRAND_LOGO_URL="/assets/images/logo.svg"
     BRAND_FAVICON_URL="/assets/images/favicon.ico"
     ```
   - Dalam kode backend (Laravel), selalu panggil via:
     `config('brand.name')`, `config('brand.tagline')`, atau `config('brand.logo_url')`.
   - Di respons API envelope (misalnya metadata respons atau healthcheck), nama sistem harus mengambil nilai dari konfigurasi ini secara dinamis.
   - **Tujuan**: Jika sewaktu-waktu nama produk atau logo diganti, Mas Affif hanya perlu mengubah 1 baris di `.env` / `config/brand.php`, dan seluruh aplikasi serta dokumen langsung tersinkronisasi tanpa repot mencari & mengganti (*find-and-replace*) satu per satu.

---

## 📚 Aturan Utama 2: Standar Dokumentasi Arsitektur & Spesifikasi Resmi (`docs/`)

Setiap pengembangan arsitektur dan endpoint backend harus didokumentasikan secara rinci, formal, dan rapi pada folder `docs/`:

1. 📐 **`docs/ARCHITECTURE.md`**
   - Menjelaskan arsitektur backend secara komprehensif (Clean Architecture / Service-Repository Pattern).
   - Topologi jaringan & komunikasi antar service (Frontend Next.js oleh Fahren $\leftrightarrow$ Backend API Laravel oleh Mas Affif).
   - Skema database relasional (tabel `devices`, `categories`, `criteria_weights`, dll).
   - Formula matematis algoritma **Simple Additive Weighting (SAW)** secara detail (Kriteria Benefit vs Cost, normalisasi matriks, dan penentuan Match Score %).
   - Diagram arsitektur berbasis Mermaid (Flowchart, Sequence Diagram, ERD).

2. 📋 **`docs/API_CONTRACT_STANDARDS.md`**
   - Format standar JSON envelope response (`success`, `message`, `data`, `meta`, `errors`).
   - Aturan HTTP Status Codes (200, 201, 400, 401, 403, 404, 422, 500).
   - Standar pagination, filtering, sorting, dan standardisasi format error validation (Laravel FormRequest standard).

3. 📝 **`docs/api-design.md`**
   - Dokumen perancangan API resmi kelompok (API Design Document).
   - Daftar seluruh endpoint API (Katalog Laptop, Filter Spek, Kuesioner Rekomendasi SPK, Komparasi Laptop, Kategori Persona).
   - Contoh nyata Request Payload dan Expected Response JSON.

4. 🌐 **`docs/openapi.yaml`**
   - Spesifikasi formal kontrak **OpenAPI 3.1.0** lengkap untuk seluruh endpoint.
   - Wajib valid dan memenuhi standar linter (Redocly / Swagger).

5. 🧪 **`docs/TESTING_GUIDE.md`**
   - Panduan praktis pengujian API menggunakan **Postman** dan **Thunder Client**.
   - Menyertakan contoh cURL, variabel environment testing, dan sampel skenario pengujian endpoint (kuesioner persona mahasiswa dan pencarian katalog).

---

## 📌 Aturan Utama 3: Sinkronisasi & Pelaporan Otomatis di Trello

* **Active Board**: `7A 🏢 NEXORA | CariSpek` (ID: `6acc5f3711be9c6d5acaa85a`)
* **Prosedur Sinkronisasi**:
  - Setiap kali menyelesaikan suatu fitur, membuat modul baru, atau memperbarui dokumen penting, **wajib** melakukan pembaruan ke kartu Trello yang relevan (via Trello MCP).
  - Berikan komentar progres yang jelas pada kartu Trello yang dikerjakan Mas Affif, centang checklist yang telah tuntas, dan pindahkan kartu ke daftar yang sesuai (*To Do* $\rightarrow$ *In Progress* $\rightarrow$ *Review* $\rightarrow$ *Done*).

---

## ⚙️ Lingkungan Pengembangan & Stack Teknologi

* **Runtime & Framework**: PHP 8.5+ & Laravel
* **Container & Dev Server**: **DDEV** (Docker-based local development environment)
* **Web Server & DB di DDEV**: Nginx + MySQL / PostgreSQL
* **Katalog Data Awal**: `Data Spek Komputer & Laptop Mahasiswa 2026.xlsx` (450 unit laptop/PC & 7 matriks persona)
* **Frontend Partner**: Next.js App Router (dikelola Fahren di repo `Renkaslana/NEXORA`)
