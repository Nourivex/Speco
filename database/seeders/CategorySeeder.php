<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CriteriaWeight;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/categories.json');
        if (!file_exists($jsonPath)) {
            return;
        }

        $categories = json_decode(file_get_contents($jsonPath), true);

        $weightsMap = [
            'CAT-01' => [ // Dasar / Pelajar
                ['code' => 'PRICE', 'name' => 'Keterjangkauan Harga', 'type' => 'cost', 'weight' => 0.35],
                ['code' => 'CPU', 'name' => 'Performa Processor', 'type' => 'benefit', 'weight' => 0.20],
                ['code' => 'RAM', 'name' => 'Kapasitas RAM', 'type' => 'benefit', 'weight' => 0.15],
                ['code' => 'DISPLAY', 'name' => 'Kenyamanan Layar', 'type' => 'benefit', 'weight' => 0.15],
                ['code' => 'WEIGHT', 'name' => 'Portabilitas / Bobot', 'type' => 'cost', 'weight' => 0.15],
            ],
            'CAT-02' => [ // Multitasking & Coding
                ['code' => 'CPU', 'name' => 'Performa Processor', 'type' => 'benefit', 'weight' => 0.30],
                ['code' => 'RAM', 'name' => 'Kapasitas RAM & Multitasking', 'type' => 'benefit', 'weight' => 0.25],
                ['code' => 'PRICE', 'name' => 'Efisiensi Anggaran', 'type' => 'cost', 'weight' => 0.20],
                ['code' => 'DISPLAY', 'name' => 'Kualitas Panel Layar', 'type' => 'benefit', 'weight' => 0.15],
                ['code' => 'WEIGHT', 'name' => 'Portabilitas / Bobot', 'type' => 'cost', 'weight' => 0.10],
            ],
            'CAT-03' => [ // Kreatif & Desain
                ['code' => 'DISPLAY', 'name' => 'Akurasi Warna Layar (Color Gamut)', 'type' => 'benefit', 'weight' => 0.30],
                ['code' => 'GPU', 'name' => 'Akselerasi Grafis GPU', 'type' => 'benefit', 'weight' => 0.25],
                ['code' => 'CPU', 'name' => 'Kecepatan Render Processor', 'type' => 'benefit', 'weight' => 0.20],
                ['code' => 'RAM', 'name' => 'Kapasitas RAM Editing', 'type' => 'benefit', 'weight' => 0.15],
                ['code' => 'PRICE', 'name' => 'Efisiensi Anggaran', 'type' => 'cost', 'weight' => 0.10],
            ],
            'CAT-04' => [ // Gaming & Teknik Berat
                ['code' => 'GPU', 'name' => 'Performa Kartu Grafis Dedicated', 'type' => 'benefit', 'weight' => 0.35],
                ['code' => 'CPU', 'name' => 'Performa Processor H-Series', 'type' => 'benefit', 'weight' => 0.25],
                ['code' => 'RAM', 'name' => 'Kapasitas RAM', 'type' => 'benefit', 'weight' => 0.20],
                ['code' => 'DISPLAY', 'name' => 'Refresh Rate Layar', 'type' => 'benefit', 'weight' => 0.10],
                ['code' => 'PRICE', 'name' => 'Efisiensi Anggaran', 'type' => 'cost', 'weight' => 0.10],
            ],
            'CAT-05' => [ // PC Rakitan Hemat
                ['code' => 'PRICE', 'name' => 'Total Biaya Komponen', 'type' => 'cost', 'weight' => 0.35],
                ['code' => 'CPU', 'name' => 'Performa Processor', 'type' => 'benefit', 'weight' => 0.25],
                ['code' => 'GPU', 'name' => 'Performa Grafis', 'type' => 'benefit', 'weight' => 0.20],
                ['code' => 'RAM', 'name' => 'Kapasitas RAM', 'type' => 'benefit', 'weight' => 0.20],
            ],
            'CAT-06' => [ // Mobilitas Klinis & Medis
                ['code' => 'WEIGHT', 'name' => 'Bobot Ringan & Ringkas', 'type' => 'cost', 'weight' => 0.30],
                ['code' => 'DISPLAY', 'name' => 'Ketajaman Layar / E-Book Reading', 'type' => 'benefit', 'weight' => 0.25],
                ['code' => 'PRICE', 'name' => 'Efisiensi Anggaran', 'type' => 'cost', 'weight' => 0.20],
                ['code' => 'CPU', 'name' => 'Processor Hemat Daya', 'type' => 'benefit', 'weight' => 0.15],
                ['code' => 'RAM', 'name' => 'Kapasitas RAM', 'type' => 'benefit', 'weight' => 0.10],
            ],
            'CAT-07' => [ // Komputasi Data & Finansial
                ['code' => 'RAM', 'name' => 'Kapasitas RAM Olah Data', 'type' => 'benefit', 'weight' => 0.30],
                ['code' => 'CPU', 'name' => 'Processor Multi-Core', 'type' => 'benefit', 'weight' => 0.25],
                ['code' => 'PRICE', 'name' => 'Efisiensi Anggaran', 'type' => 'cost', 'weight' => 0.25],
                ['code' => 'DISPLAY', 'name' => 'Ukuran Layar & Numpad', 'type' => 'benefit', 'weight' => 0.10],
                ['code' => 'WEIGHT', 'name' => 'Portabilitas / Bobot', 'type' => 'cost', 'weight' => 0.10],
            ],
        ];

        foreach ($categories as $cat) {
            $budgetRange = $cat['Rentang_Budget_IDR'] ?? '';
            // Parse min and max budget from string (e.g. "Rp 4.000.000 - Rp 7.000.000")
            preg_match_all('/\d[\d\.]*/', $budgetRange, $matches);
            $minBudget = 0;
            $maxBudget = 0;
            if (isset($matches[0][0])) {
                $minBudget = (int) str_replace('.', '', $matches[0][0]);
            }
            if (isset($matches[0][1])) {
                $maxBudget = (int) str_replace('.', '', $matches[0][1]);
            }

            $category = Category::updateOrCreate(
                ['id' => $cat['Kode_Kategori']],
                [
                    'name' => $cat['Nama_Kategori'],
                    'slug' => Str::slug($cat['Nama_Kategori']),
                    'computing_profile' => $cat['Profil_Beban_Komputasi'],
                    'min_cpu' => $cat['Rekomendasi_Min_CPU'],
                    'min_ram' => $cat['Rekomendasi_Min_RAM'],
                    'min_gpu' => $cat['Rekomendasi_Min_GPU'],
                    'min_display' => $cat['Rekomendasi_Min_Layar'],
                    'budget_range' => $budgetRange,
                    'min_budget' => $minBudget,
                    'max_budget' => $maxBudget,
                    'target_persona' => $cat['Persona_Mahasiswa'],
                    'key_features' => $cat['Fitur_Aplikasi_Kunci'],
                ]
            );

            // Criteria Weights
            if (isset($weightsMap[$category->id])) {
                foreach ($weightsMap[$category->id] as $w) {
                    CriteriaWeight::updateOrCreate(
                        [
                            'category_id' => $category->id,
                            'criterion_code' => $w['code'],
                        ],
                        [
                            'criterion_name' => $w['name'],
                            'criterion_type' => $w['type'],
                            'weight' => $w['weight'],
                        ]
                    );
                }
            }
        }
    }
}
