# 📋 Standar Kontrak API & Respons JSON

> Standar Resmi Komunikasi Backend Laravel $\leftrightarrow$ Frontend Next.js  
> Penanggung Jawab: **Muhammad Affif (Mas Affif)** — Project Lead & Backend/Data Engineer

---

## 1. Aturan Format Envelope Standar

Semua respons API wajib dibungkus dalam format envelope konsisten berikut:

### A. Respons Berhasil (Success Response)

```json
{
  "success": true,
  "status_code": 200,
  "message": "Data katalog laptop berhasil diambil",
  "data": { ... },
  "meta": {
    "system_name": "CariSpek",
    "timestamp": "2026-10-27T08:00:00Z",
    "version": "v1.0"
  }
}
```

*Nilai `"system_name"` wajib diambil secara dinamis dari `config('brand.name')`*.

### B. Respons Pagination (List Berhalaman)

```json
{
  "success": true,
  "status_code": 200,
  "message": "Daftar laptop berhasil difilter",
  "data": [ ... ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total_items": 450,
    "total_pages": 30,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "system_name": "CariSpek",
    "timestamp": "2026-10-27T08:00:00Z"
  }
}
```

### C. Respons Gagal / Validasi Error (Error Response)

```json
{
  "success": false,
  "status_code": 422,
  "message": "Validasi input kuesioner gagal",
  "errors": {
    "budget_max": [
      "Nilai budget_max harus berupa angka minimal Rp 2.000.000"
    ],
    "category_id": [
      "Kategori persona yang dipilih tidak valid"
    ]
  },
  "meta": {
    "system_name": "CariSpek",
    "timestamp": "2026-10-27T08:00:00Z"
  }
}
```

---

## 2. HTTP Status Code Conventions

| Status Code | Penggunaan | Penjelasan |
|---|---|---|
| `200 OK` | GET, PUT, PATCH | Permintaan berhasil diproses |
| `201 Created` | POST | Resource baru berhasil dibuat |
| `400 Bad Request` | Umum | Format request salah atau malformed JSON |
| `404 Not Found` | GET, PUT, DELETE | Data perangkat / kategori tidak ditemukan |
| `422 Unprocessable` | POST, PUT | Input request gagal validasi form |
| `500 Server Error` | Backend Internal | Kesalahan tak terduga pada server/database |

---

## 3. Headers Standar

* `Accept: application/json` *(Wajib disertakan client)*
* `Content-Type: application/json` *(Untuk POST/PUT)*
* `X-App-Name: config('brand.name')` *(Otomatis dikirimkan response header)*
