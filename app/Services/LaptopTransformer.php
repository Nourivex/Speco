<?php

namespace App\Services;

use App\Models\Device;
use Illuminate\Support\Str;

class LaptopTransformer
{
    /**
     * Transform a Device model into the exact Laptop interface expected by Next.js frontend.
     */
    public static function toFrontendLaptop(Device $device): array
    {
        $slug = self::generateSlug($device);

        // CPU specs
        $cpuScore = self::evaluateCpuBench($device->processor);
        $cpuCores = self::estimateCpuCores($device->processor);

        // GPU specs
        $gpuVram = self::estimateGpuVram($device->gpu, $device->is_dedicated_gpu);

        // RAM specs
        $ramGb = (int) $device->ram_gb;
        $maxRamGb = $device->is_upgradeable_ram ? max(32, $ramGb * 2) : $ramGb;
        $ramType = str_contains(strtolower($device->processor), 'ryzen 7') || str_contains(strtolower($device->processor), 'ultra') ? 'DDR5' : 'DDR4';

        // Display specs
        $displayInfo = self::parseDisplay($device->display, $device->color_gamut);

        // UseCases & Target Personas
        $useCases = self::determineUseCases($device);
        $targetPersonas = self::determineTargetPersonas($device);

        // Illustration image mapping
        $shape = 'mainstream';
        $color = 'silver';
        if ($device->weight_kg <= 1.35) {
            $shape = 'ultrabook';
            $color = 'mist';
        } elseif ($device->is_dedicated_gpu || $device->price_idr >= 15000000) {
            $shape = 'creator';
            $color = 'graphite';
        }

        // Pros and Cons
        $pros = array_filter(array_map('trim', explode(',', $device->pros ?? 'Performa stabil, Desain modern')));
        $cons = array_filter(array_map('trim', explode(',', $device->cons ?? 'Fitur standar')));

        return [
            'id' => strtolower($device->id),
            'slug' => $slug,
            'brand' => $device->brand_name,
            'model' => $device->model_name,
            'priceIdr' => (int) $device->price_idr,
            'cpu' => [
                'name' => $device->processor,
                'cores' => $cpuCores,
                'threads' => $cpuCores * 2,
                'benchScore' => $cpuScore,
            ],
            'gpu' => [
                'type' => $device->is_dedicated_gpu ? 'dedicated' : 'integrated',
                'name' => $device->gpu,
                'vramGb' => $gpuVram,
            ],
            'ram' => [
                'gb' => $ramGb,
                'type' => $ramType,
                'upgradeable' => (bool) $device->is_upgradeable_ram,
                'maxGb' => $maxRamGb,
            ],
            'storage' => [
                'gb' => $device->storage_gb ?: 512,
                'type' => 'NVMe SSD',
            ],
            'display' => [
                'inch' => $displayInfo['inch'],
                'resolution' => $displayInfo['resolution'],
                'panel' => $displayInfo['panel'],
                'srgbPercent' => $displayInfo['srgbPercent'],
                'refreshHz' => $displayInfo['refreshHz'],
            ],
            'batteryWh' => $device->weight_kg <= 1.4 ? 54 : 60,
            'weightKg' => (float) $device->weight_kg,
            'ports' => ['USB-C', 'USB-A', 'HDMI', 'Audio'],
            'useCases' => $useCases,
            'targetPersonas' => $targetPersonas,
            'pros' => !empty($pros) ? array_values($pros) : ['Performa tangguh di kelasnya', 'Desain ringkas'],
            'cons' => !empty($cons) ? array_values($cons) : ['Baterai standar untuk mobilitas tinggi'],
            'imageUrl' => "/images/laptops/{$shape}-{$color}-34.webp",
            'image' => [
                'shape' => $shape,
                'color' => $color,
            ],
            'marketplaceUrl' => $device->purchase_platform ?: 'https://tokopedia.com',
            'isMock' => false,
        ];
    }

    public static function generateSlug(Device $device): string
    {
        return Str::slug($device->brand_name . '-' . $device->model_name . '-' . $device->id);
    }

    public static function evaluateCpuBench(string $cpu): int
    {
        $c = strtolower($cpu);
        if (str_contains($c, 'ultra 9') || str_contains($c, 'i9') || str_contains($c, 'ryzen 9') || str_contains($c, 'm3 max')) return 98;
        if (str_contains($c, 'ultra 7') || str_contains($c, 'i7-13') || str_contains($c, 'i7-14') || str_contains($c, 'ryzen 7 7') || str_contains($c, 'ryzen 7 8') || str_contains($c, 'm3 pro') || str_contains($c, 'm2 pro')) return 90;
        if (str_contains($c, 'i7') || str_contains($c, 'ryzen 7') || str_contains($c, 'm3') || str_contains($c, 'm2')) return 85;
        if (str_contains($c, 'ultra 5') || str_contains($c, 'i5-13') || str_contains($c, 'i5-14') || str_contains($c, 'ryzen 5 7') || str_contains($c, 'ryzen 5 8')) return 82;
        if (str_contains($c, 'i5') || str_contains($c, 'ryzen 5') || str_contains($c, 'm1')) return 76;
        if (str_contains($c, 'i3') || str_contains($c, 'ryzen 3')) return 64;
        return 50;
    }

    public static function estimateCpuCores(string $cpu): int
    {
        $c = strtolower($cpu);
        if (str_contains($c, 'i9') || str_contains($c, 'ryzen 9') || str_contains($c, 'ultra 9')) return 16;
        if (str_contains($c, 'i7') || str_contains($c, 'ryzen 7') || str_contains($c, 'ultra 7')) return 8;
        if (str_contains($c, 'i5') || str_contains($c, 'ryzen 5') || str_contains($c, 'ultra 5')) return 6;
        if (str_contains($c, 'i3') || str_contains($c, 'ryzen 3')) return 4;
        return 4;
    }

    public static function estimateGpuVram(string $gpu, bool $isDedicated): int
    {
        if (!$isDedicated) return 0;
        if (preg_match('/(\d+)\s*GB/i', $gpu, $matches)) {
            return (int) $matches[1];
        }
        $g = strtolower($gpu);
        if (str_contains($g, '4070') || str_contains($g, '3070')) return 8;
        if (str_contains($g, '4060') || str_contains($g, '3060') || str_contains($g, 'rx 7600')) return 8;
        if (str_contains($g, '4050')) return 6;
        if (str_contains($g, '3050') || str_contains($g, '2050')) return 4;
        return 4;
    }

    public static function parseDisplay(?string $display, ?string $colorGamut): array
    {
        $text = strtolower(($display ?? '') . ' ' . ($colorGamut ?? ''));
        
        $inch = 14.0;
        if (preg_match('/(\d+(?:\.\d+)?)\s*(?:\"|inch)/i', $text, $matches)) {
            $inch = (float) $matches[1];
        }

        $resolution = '1920x1080';
        if (str_contains($text, '2.8k') || str_contains($text, '2880')) {
            $resolution = '2880x1800';
        } elseif (str_contains($text, '2.5k') || str_contains($text, '2560')) {
            $resolution = '2560x1600';
        } elseif (str_contains($text, '16:10') || str_contains($text, '1200')) {
            $resolution = '1920x1200';
        }

        $panel = 'IPS';
        if (str_contains($text, 'oled')) {
            $panel = 'OLED';
        } elseif (str_contains($text, 'va')) {
            $panel = 'VA';
        } elseif (str_contains($text, 'tn')) {
            $panel = 'TN';
        }

        $srgbPercent = 65;
        if ($panel === 'OLED' || str_contains($text, '100% srgb') || str_contains($text, 'dci-p3')) {
            $srgbPercent = 100;
        } elseif (str_contains($text, 'ntsc') || str_contains($text, '45%')) {
            $srgbPercent = 45;
        }

        $refreshHz = 60;
        if (preg_match('/(\d+)\s*hz/i', $text, $matches)) {
            $refreshHz = (int) $matches[1];
        }

        return [
            'inch' => $inch,
            'resolution' => $resolution,
            'panel' => $panel,
            'srgbPercent' => $srgbPercent,
            'refreshHz' => $refreshHz,
        ];
    }

    public static function determineUseCases(Device $device): array
    {
        $cases = ['office'];
        $cat = $device->category_id;
        if ($cat === 'CAT-02') $cases = ['programming', 'office', 'uiux'];
        elseif ($cat === 'CAT-03') $cases = ['uiux', 'desain-grafis', 'video', 'office'];
        elseif ($cat === 'CAT-04') $cases = ['3d', 'gaming', 'video', 'programming'];
        elseif ($cat === 'CAT-07') $cases = ['data', 'office'];
        elseif ($cat === 'CAT-06') $cases = ['office', 'data'];

        if ($device->is_dedicated_gpu && !in_array('gaming', $cases)) {
            $cases[] = 'gaming';
        }
        if ($device->ram_gb >= 16 && !in_array('programming', $cases)) {
            $cases[] = 'programming';
        }

        return array_values(array_unique($cases));
    }

    public static function determineTargetPersonas(Device $device): array
    {
        $cat = $device->category_id;
        if ($cat === 'CAT-02' || $cat === 'CAT-04' || $cat === 'CAT-05') return ['teknik'];
        if ($cat === 'CAT-03') return ['desain'];
        if ($cat === 'CAT-06' || $cat === 'CAT-07') return ['profesional'];
        return ['umum'];
    }
}
