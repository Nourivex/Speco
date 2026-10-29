# AGENTS.md: Panduan & Standar Kerja AI Assistant (CariSpek / Speco)

Dokumen ini adalah instruksi wajib bagi AI Coding Assistant (Antigravity, Cursor, Claude, dll.) saat bekerja sama dengan Mas Affif dalam repositori Rekayasa Perangkat Lunak (RPL).

---

## 1. Profil Pengguna & Etika Komunikasi

* **Nama Lengkap**: Muhammad Affif
* **Panggilan Resmi**: **Mas Affif** (Selalu sapa pengguna dengan sebutan "Mas Affif").
* **Peran Utama**:
  1. **Project Lead**: Pengambil keputusan arah arsitektur, prioritas sprint, dan timeline teknis.
  2. **Backend Developer & Data Engineer**: Penanggung jawab skema database MariaDB, implementasi REST API, dan algoritma sistem pendukung keputusan (SPK) SAW.
* **Tim**: **NEXORA (Kelompok 7A)**: Mata Kuliah Rekayasa Perangkat Lunak (RPL).
* **Susunan Anggota Tim**:
  - **Mas Affif** (@nourivex / @muhammadaffif): Project Lead & Backend/Data Engineer.
  - **Zakky Fawwaz** (@zakyfawwaz701): System Analyst & Koordinator Dosen Pengawas.
  - **Muhamad Fahren Andrean Rangkuti** (@Renkaslana): Frontend Developer (Next.js).
  - **Yesa Prayugo** (@yesaprayugo): UI/UX Designer & QA Lead.
  - **Dosen Pengawas**: redmouse studio (@redmousestudio).

---

## 2. Aturan Ketat Anti-AI-Slop & Gaya Bahasa (Zero Fluff Policy)

> [!CAUTION]
> **DILARANG KERAS MENGHASILKAN TEKS AI SLOP!**
> Kualitas tulisan, dokumentasi, commit message, dan respons asisten harus bernilai teknis tinggi, padat, alami, dan bebas dari gaya bahasa generatif yang klise.

### Larangan Khusus:
1. **Dilarang Menggunakan Tanda Em-Dash (`—`)**:
   - Jangan gunakan karakter tanda pisah panjang `—` di judul, narasi kalimat, maupun daftar poin.
   - Gunakan tanda hubung biasa `-`, titik dua `:`, titik koma `;`, atau tanda kurung `()` sebagai pemisah kalimat.
2. **Dilarang Menggunakan Frasa Klise Robotik Khas AI**:
   - Contoh terlarang:
     * *"Sebagai sebuah platform yang..."*
     * *"Dalam era digital yang terus berkembang / dalam lanskap modern..."*
     * *"Tidak dapat dipungkiri bahwa..."*
     * *"Menyelami lebih dalam ke dalam..."*
     * *"Patut dicatat bahwa..."* atau *"Penting untuk diingat bahwa..."*
     * *"Merupakan bukti nyata dari komitmen..."*
     * *"Bagaikan dua sisi mata uang..."*
   - Tuliskan inti informasi secara langsung (*deductive, to-the-point*).
3. **Hindari Buzzword Repetitif Tanpa Makna Riil**:
   - Kurangi pengulangan kata generik seperti: *"komprehensif"*, *"holistik"*, *"robust"*, *"sinergis"*, *"revolusioner"*. Gantilah dengan penjelasan teknis konkret (misal: *"memiliki 13 automated tests dengan 51 assertions"* daripada sekadar *"sistem testing yang komprehensif dan robust"*).
4. **Hindari Emoji Berlebihan**:
   - Jangan menempelkan emoji di setiap awal kalimat atau baris paragraf. Gunakan emoji secara minimal hanya untuk badge status atau pemisah bab utama.
5. **Bahasa Indonesia Formal Ragam Rekayasa & Ilmiah**:
   - Ikuti kaidah PUEBI / EYD V. Kalimat harus ringkas, lugas, mengalir logis, dan objektif.

---

## 3. Kebijakan Git Remote & Repositori Resmi

> [!IMPORTANT]
> **DILARANG PUSH KE REPOSITORI `Renkaslana/NEXORA` LAGI!**
> Seluruh pekerjaan dan push kode ke GitHub HANYA ditujukan ke repositori pribadi milik Mas Affif:
> **`https://github.com/Nourivex/Speco`**

### Pembagian Cabang Resmi di `Nourivex/Speco`:
* **Cabang `main`**:
  - Repositori utama untuk seluruh backend Laravel, DDEV container, skrip database, dataset 450 laptop, algoritma SPK SAW, automated tests, dan dokumen spesifikasi `docs/`.
* **Cabang `UI`**:
  - Repositori khusus untuk kode antarmuka Next.js App Router (Tailwind CSS, shadcn/ui, asset studio renders).
* **Konfigurasi Remote Lokal**:
  - Pastikan `git remote -v` di root maupun di folder `frontend/` hanya mengarah ke `git@github.com:Nourivex/Speco.git` sebagai remote `origin`.

---

## 4. Konfigurasi Brand Dinamis (Single Source of Truth)

Dilarang keras melakukan hardcode nama produk (teks `"CariSpek"`, `"NEXORA"`, `"Speco"`) maupun path aset logo di dalam business logic, controller, response envelope, query database, atau kode antarmuka.

* Seluruh metadata merek bersumber dari satu titik: `config/brand.php` dan file `.env`.
* Panggilan wajib di backend:
  `config('brand.name')`, `config('brand.tagline')`, `config('brand.logo_url')`.
* Response API envelope harus mengambil konfigurasi ini secara dinamis pada metadata respons (`meta.system_name`).

---

## 5. Standar Dokumentasi Arsitektur & Spesifikasi (`docs/`)

Setiap perubahan arsitektur, basis data, dan endpoint wajib tercatat rapi pada berkas di folder `docs/`:

1. `docs/ARCHITECTURE.md`: Arsitektur Clean Architecture, topologi DDEV, ERD database, dan formulasi matematis SAW.
2. `docs/API_CONTRACT_STANDARDS.md`: Format envelope JSON standar (`success`, `status_code`, `message`, `data`, `meta`, `errors`), aturan HTTP status code, dan validasi FormRequest.
3. `docs/api-design.md`: Spesifikasi lengkap endpoint katalog, rekomendasi SAW, komparasi, dan konfigurasi.
4. `docs/openapi.yaml`: Kontrak formal OpenAPI 3.1.0 (valid linter).
5. `docs/TESTING_GUIDE.md`: Panduan pengujian dengan cURL, Postman, dan Thunder Client.

---

## 6. Sinkronisasi Trello MCP

* **Board Aktif**: `7A 🏢 NEXORA | CariSpek` (ID: `6acc5f3711be9c6d5acaa85a`).
* Setiap penyelesaian milestone, pembaruan dataset, atau fitur backend selesai, lakukan pembaruan ke kartu Trello yang relevan:
  - Berikan komentar progres yang ringkas, teknis, dan jelas.
  - Perbarui checklist kartu dan set `dueComplete: true` jika milestone selesai.
  - Pindahkan kartu ke daftar yang tepat (*To Do* -> *In Progress* -> *Review* -> *Done*).

---

## 7. Lingkungan Pengembangan & Eksekusi

* **Runtime & Framework**: PHP 8.4+ & Laravel 12.
* **Local Container**: DDEV (Nginx, PHP-FPM, MariaDB 11.8).
* **Frontend Runtime**: Node.js 20+ (Next.js 16 App Router di folder `frontend/`).
* **Katalog Awal**: `Data Spek Komputer & Laptop Mahasiswa 2026.xlsx` (450 entitas & 7 persona).
