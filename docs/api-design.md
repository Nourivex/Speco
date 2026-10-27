# 📝 Dokumen Perancangan API Resmi (API Design Document v1)

> Proyek Rekayasa Perangkat Lunak (Kelompok 7A - Tim NEXORA)  
> Penanggung Jawab: **Muhammad Affif (Mas Affif)** — Project Lead & Backend/Data Engineer

---

## 1. Daftar Endpoint API

Base URL: `https://nexora-backend.ddev.site/api/v1` atau `http://localhost:8000/api/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/config` | Mengambil konfigurasi brand, nama sistem, tagline, dan aset logo |
| `GET` | `/health` | Pemeriksaan kesehatan service backend dan database |
| `GET` | `/categories` | Mengambil daftar 7 persona & matriks kebutuhan mahasiswa (CAT-01 s/d CAT-07) |
| `GET` | `/categories/{id}` | Mengambil detail spesifikasi kriteria suatu persona |
| `GET` | `/brands` | Mengambil daftar brand produsen laptop yang tersedia (Lenovo, Asus, HP, dll) |
| `GET` | `/devices` | Mengambil katalog 450 laptop dengan filter harga, RAM, tipe, dan search |
| `GET` | `/devices/{id}` | Mengambil detail spesifikasi lengkap satu perangkat (termasuk pros & cons) |
| `POST` | `/recommendations` | **Core SPK Engine**: Menghitung rekomendasi laptop via metode SAW berdasarkan budget & persona |
| `POST` | `/compare` | Membandingkan 2 hingga 3 laptop secara berdampingan (side-by-side comparison) |

---

## 2. Rincian Endpoint Kunci

### A. `GET /config` (Dynamic Branding)
* **Deskripsi**: Menyediakan identitas brand ke frontend Next.js agar nama dan logo tidak di-hardcode di frontend.
* **Response Contoh**:
```json
{
  "success": true,
  "status_code": 200,
  "message": "Konfigurasi sistem berhasil dimuat",
  "data": {
    "app_name": "CariSpek",
    "brand_name": "CariSpek",
    "tagline": "Sistem Rekomendasi & Pemilihan Laptop Cerdas Berbasis Kebutuhan & Budget",
    "organization": "NEXORA Kelompok 7A",
    "logo_url": "/assets/images/logo.svg",
    "support_contact": "affif@nexora.local"
  }
}
```

---

### B. `POST /recommendations` (Mesin Rekomendasi SAW)
* **Deskripsi**: Menerima input kuesioner dari Wizard Frontend Fahren, menjalankan pembobotan kriteria, dan mengembalikan ranking laptop terbaik.
* **Request Payload**:
```json
{
  "budget_min": 7000000,
  "budget_max": 12000000,
  "category_id": "CAT-02",
  "preferred_device_type": "Laptop",
  "priority_focus": "performance",
  "require_upgradeable_ram": true
}
```
* **Response Contoh**:
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rekomendasi laptop berhasil dikalkulasi dengan algoritma SAW",
  "data": {
    "selected_persona": {
      "id": "CAT-02",
      "name": "Multitasking & Coding",
      "target_major": "Mahasiswa Teknik Informatika, SI, Sains Data & AI"
    },
    "total_matched": 18,
    "top_recommendations": [
      {
        "rank": 1,
        "match_score": 94.8,
        "device": {
          "id": "LP005",
          "brand": "MSI",
          "model_name": "Modern 14",
          "processor": "Intel Core i5-1235U",
          "gpu": "Intel Iris Xe Graphics",
          "ram_gb": 16,
          "is_upgradeable_ram": true,
          "storage": "512GB NVMe SSD",
          "display": "14\" FHD IPS Anti-Glare",
          "weight_kg": 1.4,
          "price_idr": 8499000,
          "pros": "Ringan, RAM upgradeable, keyboard nyaman",
          "cons": "Tanpa port Thunderbolt"
        },
        "reasoning": "Sangat cocok untuk kebutuhan Coding & Docker dengan RAM 16GB yang masih dapat ditingkatkan dan harga di bawah batas anggaran."
      }
    ]
  }
}
```

---

### C. `POST /compare` (Komparasi Laptop)
* **Request Payload**:
```json
{
  "device_ids": ["LP004", "LP005"]
}
```
* **Response**: Mengembalikan objek perbandingan spesifikasi head-to-head untuk tabel komparasi frontend.
