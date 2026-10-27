# 📐 Arsitektur Sistem & Spesifikasi Teknis Backend

> Dokumen Arsitektur Resmi Proyek Rekayasa Perangkat Lunak (Kelompok 7A - Tim NEXORA)  
> Penanggung Jawab: **Muhammad Affif (Mas Affif)** — Project Lead & Backend/Data Engineer

---

## 1. Ringkasan Sistem & Prinsip Desain

Sistem ini adalah platform **Sistem Pendukung Keputusan (SPK)** pemilihan komputer dan laptop berbasis kebutuhan beban komputasi dan anggaran mahasiswa/pengguna. 

### Prinsip Utama:
1. **Dynamic Branding**: Nama produk dan identitas visual bersifat *white-label configurable* (bersumber dari `config('brand')` / `.env`).
2. **Decoupled Architecture**: Frontend (Next.js) dan Backend (Laravel RESTful API) terpisah secara bersih (*headless*).
3. **Reproducible Local Dev**: Dijalankan di atas **DDEV** (Docker containerized) untuk konsistensi lingkungan pengembangan.
4. **Data-Driven & Explainable**: Keputusan rekomendasi didasarkan pada metode **Simple Additive Weighting (SAW)** yang transparan dan dapat dijelaskan perhitungannya (*explainable AI/SPK*).

---

## 2. Topologi Jaringan & Arsitektur Komunikasi

Berikut adalah diagram alur komunikasi antar service dalam ekosistem aplikasi:

```mermaid
flowchart TD
    subgraph Client["🖥️ Client Tier (Frontend - Fahren)"]
        Browser["Web Browser (User / Mahasiswa)"]
        NextApp["Next.js App Router (Port 3000)"]
        MockData["Mock Data (Deprecated)"]
        Browser --> NextApp
    end

    subgraph Gateway["🌐 Networking & Gateway"]
        ReverseProxy["DDEV Nginx Router (*.ddev.site)"]
        NextApp -- "HTTP REST (JSON) /api/*" --> ReverseProxy
    end

    subgraph Backend["⚙️ Backend Tier (Laravel - Mas Affif)"]
        LaravelApp["Laravel 11/12 Core"]
        BrandConfig["Brand Config (Single Source of Truth)"]
        Controller["API Controllers"]
        SawService["SawRecommendationService (SPK Engine)"]
        
        ReverseProxy --> LaravelApp
        BrandConfig --> LaravelApp
        LaravelApp --> Controller
        Controller --> SawService
    end

    subgraph DatabaseTier["🗄️ Database & Storage Tier"]
        DB[(MySQL / MariaDB via DDEV)]
        ExcelSource["Data Spek Komputer & Laptop Mahasiswa 2026.xlsx\n(450 Data & 7 Matriks)"]
        Seeder["Database Seeder Pipeline"]
        
        ExcelSource --> Seeder
        Seeder --> DB
        SawService <--> DB
    end
```

---

## 3. Skema Basis Data Relasional (ERD)

```mermaid
erDiagram
    BRANDS ||--o{ DEVICES : produces
    CATEGORIES ||--o{ DEVICES : categorizes
    CATEGORIES ||--o{ CRITERIA_WEIGHTS : configures
    DEVICES ||--o{ RECOMMENDATION_ITEMS : matched_in

    CATEGORIES {
        string id PK "CAT-01 s/d CAT-07"
        string name "Nama Kategori (ex: Multitasking & Coding)"
        string computing_profile "Office, Docker, Rendering, dll"
        string min_cpu "Rekomendasi CPU Minimal"
        string min_ram "Rekomendasi RAM Minimal"
        string min_gpu "Rekomendasi GPU Minimal"
        string min_display "Ukuran dan Color Gamut Layar"
        bigint min_budget "Batas bawah budget (IDR)"
        bigint max_budget "Batas atas budget (IDR)"
        string target_persona "Jurusan/Persona Mahasiswa"
    }

    BRANDS {
        int id PK
        string name "Lenovo, ASUS, HP, Apple, dsb"
        string slug
    }

    DEVICES {
        string id PK "LP001, LP002, dsb"
        string category_id FK
        int brand_id FK
        string model_name "Contoh: Vivobook Go 14"
        string device_type "Laptop, PC Rakitan, 2-in-1, Mini PC"
        string processor "CPU Model"
        int cpu_cores "Jumlah core CPU"
        string gpu "Kartu grafis GPU"
        boolean is_dedicated_gpu
        int ram_gb "Kapasitas RAM dalam GB"
        boolean is_upgradeable_ram
        string storage "Kapasitas dan jenis SSD/HDD"
        string display "Ukuran panel & resolusi"
        string color_gamut "100% sRGB, NTSC 45%, dsb"
        decimal weight_kg "Bobot perangkat"
        bigint price_idr "Harga pasar estimasi"
        string purchase_url "Link e-commerce/official"
        string warranty "Garansi resmi"
        text pros "Kelebihan perangkat"
        text cons "Kekurangan perangkat"
    }

    CRITERIA_WEIGHTS {
        int id PK
        string category_id FK
        string criterion_code "C1_PRICE, C2_CPU, C3_RAM, C4_GPU, C5_DISPLAY, C6_WEIGHT"
        string criterion_type "COST atau BENEFIT"
        decimal weight "Bobot preferensi (total = 1.0)"
    }
```

---

## 4. Formula Matematis Algoritma Simple Additive Weighting (SAW)

Metode SAW dipilih karena memiliki landasan ilmiah yang kokoh dalam mata kuliah Rekayasa Perangkat Lunak, memberikan hasil yang deterministik, dan mudah dijelaskan (*explainable*).

### A. Tahapan Perhitungan

1. **Filtering Mutlak**:
   Sistem menyaring perangkat alternatif ($A_i$) yang berada dalam toleransi anggaran pengguna:
   $$\text{Price}(A_i) \le \text{Budget}_{\max} \times 1.15$$

2. **Normalisasi Matriks Keputusan ($R$)**:
   Untuk setiap alternatif ke-$i$ dan kriteria ke-$j$:

   * **Kriteria Keuntungan (Benefit)** — misal: Performa CPU, Kapasitas RAM, Kualitas Layar:
     $$r_{ij} = \frac{x_{ij}}{\max_i (x_{ij})}$$

   * **Kriteria Biaya (Cost)** — misal: Harga, Bobot (semakin rendah semakin baik):
     $$r_{ij} = \frac{\min_i (x_{ij})}{x_{ij}}$$

3. **Perhitungan Nilai Preferensi ($V_i$)**:
   $$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$$
   Dimana:
   * $V_i$ = Nilai preferensi akhir untuk alternatif perangkat $A_i$ ($0 < V_i \le 1.0$).
   * $w_j$ = Bobot kriteria ke-$j$ yang ditentukan oleh Persona/Jurusan pengguna ($\sum w_j = 1.0$).
   * $r_{ij}$ = Nilai kinerja ternormalisasi.

4. **Konversi Match Score (%)**:
   $$\text{MatchScore}(A_i) = \text{round}(V_i \times 100, 1)\%$$
