<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Device;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/devices.json');
        if (!file_exists($jsonPath)) {
            return;
        }

        $devices = json_decode(file_get_contents($jsonPath), true);

        $categoryMapping = [
            'Dasar/Pelajar' => 'CAT-01',
            'Literasi & Administrasi' => 'CAT-01',
            'Multitasking & Coding' => 'CAT-02',
            'Kreatif & Desain' => 'CAT-03',
            'Gaming & Teknik Berat' => 'CAT-04',
            'PC Rakitan Hemat' => 'CAT-05',
            'Mobilitas & Riset Klinis' => 'CAT-06',
            'Mobilitas Klinis & Medis' => 'CAT-06',
            'Mobilitas & Fleksibilitas' => 'CAT-06',
            'Komputasi Data & Dokumen' => 'CAT-07',
            'Komputasi Data & Finansial' => 'CAT-07',
        ];

        // Cache brands
        $brandsCache = [];

        foreach ($devices as $d) {
            $brandName = trim($d['Brand'] ?? 'Generic');
            if (!isset($brandsCache[$brandName])) {
                $brand = Brand::firstOrCreate(
                    ['name' => $brandName],
                    ['slug' => Str::slug($brandName)]
                );
                $brandsCache[$brandName] = $brand;
            } else {
                $brand = $brandsCache[$brandName];
            }

            $catName = trim($d['Kategori_Target'] ?? '');
            $categoryId = $categoryMapping[$catName] ?? null;

            // Dedicated GPU check
            $gpuText = strtolower($d['Kartu_Grafis_GPU'] ?? '');
            $isDedicatedGpu = str_contains($gpuText, 'rtx') ||
                              str_contains($gpuText, 'gtx') ||
                              str_contains($gpuText, 'rx 6') ||
                              str_contains($gpuText, 'rx 7') ||
                              str_contains($gpuText, 'dedicated');

            // Storage GB parsing
            $storageStr = $d['Storage_GB_Tipe'] ?? '256GB SSD';
            $storageGb = 256;
            if (preg_match('/(\d+)\s*(?:GB|TB)/i', $storageStr, $match)) {
                $num = (int) $match[1];
                if (stripos($storageStr, 'TB') !== false) {
                    $storageGb = $num * 1024;
                } else {
                    $storageGb = $num;
                }
            }

            // RAM GB parsing
            $ramGb = (float) ($d['RAM_GB'] ?? 8.0);

            // Weight parsing
            $weightKg = (float) ($d['Bobot_kg'] ?? 1.5);

            // Price parsing
            $priceIdr = (int) round((float) ($d['Estimasi_Harga_Pasar_IDR'] ?? 0));

            // Upgradeable RAM parsing
            $isUpgradeable = strtolower(trim($d['Upgradeable_RAM'] ?? '')) === 'ya';

            // Display parsing
            $displayStr = $d['Layar_Ukuran_Panel_ColorGamut'] ?? '';
            $colorGamut = null;
            if (stripos($displayStr, 'sRGB') !== false) {
                $colorGamut = '100% sRGB';
            } elseif (stripos($displayStr, 'OLED') !== false) {
                $colorGamut = '100% DCI-P3 (OLED)';
            } elseif (stripos($displayStr, 'NTSC') !== false) {
                $colorGamut = '45% NTSC';
            }

            Device::updateOrCreate(
                ['id' => $d['ID_Perangkat']],
                [
                    'category_id' => $categoryId,
                    'category_name' => $catName,
                    'target_major' => $d['Target_Mahasiswa_Jurusan'] ?? null,
                    'brand_id' => $brand->id,
                    'brand_name' => $brand->name,
                    'model_name' => $d['Model_Seri'] ?? '',
                    'device_type' => $d['Tipe_Perangkat'] ?? 'Laptop',
                    'processor' => $d['Processor_CPU'] ?? '',
                    'gpu' => $d['Kartu_Grafis_GPU'] ?? '',
                    'is_dedicated_gpu' => $isDedicatedGpu,
                    'ram_gb' => $ramGb,
                    'is_upgradeable_ram' => $isUpgradeable,
                    'storage' => $storageStr,
                    'storage_gb' => $storageGb,
                    'display' => $displayStr,
                    'color_gamut' => $colorGamut,
                    'weight_kg' => $weightKg,
                    'price_idr' => $priceIdr,
                    'purchase_platform' => $d['Platform_Rekomendasi_Beli'] ?? null,
                    'warranty' => $d['Status_Garansi_Resmi'] ?? null,
                    'usecase_tags' => $d['Rekomendasi_UseCase_Tag'] ?? null,
                    'pros' => $d['Pros_Kelebihan'] ?? null,
                    'cons' => $d['Cons_Kekurangan'] ?? null,
                ]
            );
        }

        // Update brand counts
        foreach (Brand::all() as $b) {
            $b->update(['device_count' => $b->devices()->count()]);
        }
    }
}
