# 🧪 Panduan Pengujian API (API Testing Guide)

> Panduan Praktis Pengujian Endpoint Backend CariSpek  
> Penanggung Jawab: **Muhammad Affif (Mas Affif)** — Project Lead & Backend/Data Engineer

---

## 1. Lingkungan Pengujian (Testing Environment)

* **Base URL DDEV**: `https://nexora-backend.ddev.site/api/v1`
* **Base URL Localhost**: `http://localhost:8000/api/v1`
* **Header Wajib**:
  * `Accept: application/json`
  * `Content-Type: application/json`

---

## 2. Contoh Skenario Pengujian Menggunakan cURL

### Skenario 1: Verifikasi Dynamic Brand & Health
```bash
curl -X GET https://nexora-backend.ddev.site/api/v1/config \
  -H "Accept: application/json"
```
**Ekspektasi**: Status 200 dengan nilai `brand_name`, `tagline`, dan `logo_url` yang dinamis.

---

### Skenario 2: Mengambil 7 Kategori Persona Mahasiswa
```bash
curl -X GET https://nexora-backend.ddev.site/api/v1/categories \
  -H "Accept: application/json"
```
**Ekspektasi**: Status 200 dengan 7 kategori (CAT-01 s/d CAT-07) beserta rentang budget dan profil komputasi.

---

### Skenario 3: Filter Katalog Laptop (Coding & Budget < Rp 10 Jt)
```bash
curl -X GET "https://nexora-backend.ddev.site/api/v1/devices?category_id=CAT-02&max_price=10000000&min_ram=16" \
  -H "Accept: application/json"
```
**Ekspektasi**: Status 200 dengan daftar laptop yang sesuai kriteria pagination.

---

### Skenario 4: Menjalankan Algoritma Rekomendasi SAW
```bash
curl -X POST https://nexora-backend.ddev.site/api/v1/recommendations \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 7000000,
    "budget_max": 12000000,
    "category_id": "CAT-02",
    "preferred_device_type": "Laptop",
    "priority_focus": "performance"
  }'
```
**Ekspektasi**: Status 200 dengan `top_recommendations` berperingkat, `match_score` (persentase kecocokan), serta `reasoning` (alasan pemilihan).

---

## 3. Pengujian via Postman / Thunder Client

1. **Import OpenAPI**:
   - Di Postman atau Thunder Client, klik menu **Import**.
   - Pilih file: `docs/openapi.yaml`.
   - Seluruh 6+ endpoint akan otomatis ter-generate lengkap dengan parameter dan body payload.
2. **Environment Variables**:
   Buat environment baru bernama `CariSpek-Local` dengan variabel:
   - `baseUrl`: `https://nexora-backend.ddev.site/api/v1`
