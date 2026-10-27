<?php

namespace App\Services;

use App\Models\Category;
use App\Models\CriteriaWeight;
use App\Models\Device;
use Illuminate\Support\Collection;

class SawRecommendationService
{
    /**
     * Hitung rekomendasi laptop menggunakan metode Simple Additive Weighting (SAW).
     */
    public function recommend(array $params): array
    {
        $categoryId = $params['category_id'] ?? 'CAT-02';
        $category = Category::with('criteriaWeights')->find($categoryId)
            ?? Category::with('criteriaWeights')->first();

        $budgetMin = (int) ($params['budget_min'] ?? 0);
        $budgetMax = (int) ($params['budget_max'] ?? 20000000);
        $preferredType = $params['preferred_device_type'] ?? null;
        $priorityFocus = $params['priority_focus'] ?? 'balanced';
        $upgradeableOnly = (bool) ($params['require_upgradeable_ram'] ?? false);
        $dedicatedGpuOnly = (bool) ($params['require_dedicated_gpu'] ?? false);
        $limit = (int) ($params['limit'] ?? 5);

        // 1. Candidate Selection / Filtering Mutlak
        $query = Device::query();

        // Toleransi budget max +15% untuk menemukan deal potensial
        $budgetCeiling = (int) ($budgetMax * 1.15);
        $query->where('price_idr', '<=', $budgetCeiling);

        if ($budgetMin > 0) {
            $query->where('price_idr', '>=', (int) ($budgetMin * 0.85));
        }

        if ($preferredType && in_array($preferredType, ['Laptop', 'PC Rakitan', 'Laptop 2-in-1', 'Mini PC', 'PC Desktop'])) {
            $query->where('device_type', $preferredType);
        }

        if ($upgradeableOnly) {
            $query->where('is_upgradeable_ram', true);
        }

        if ($dedicatedGpuOnly) {
            $query->where('is_dedicated_gpu', true);
        }

        $candidates = $query->get();

        // Jika filter terlalu ketat sehingga kandidat sedikit, ambil perangkat di bawah batas budget
        if ($candidates->count() < 3) {
            $candidates = Device::where('price_idr', '<=', $budgetCeiling)->get();
        }

        if ($candidates->isEmpty()) {
            return [
                'selected_persona' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'target_persona' => $category->target_persona,
                ],
                'total_candidates' => 0,
                'top_recommendations' => [],
            ];
        }

        // 2. Ambil Bobot Kriteria & Sesuaikan dengan Priority Focus
        $weights = $this->resolveCriteriaWeights($category, $priorityFocus);

        // 3. Evaluasi Skor Numerik untuk Setiap Kriteria
        $scoredCandidates = $candidates->map(function (Device $device) {
            return [
                'device' => $device,
                'raw' => [
                    'price' => (float) $device->price_idr,
                    'cpu' => $this->evaluateCpuScore($device->processor),
                    'ram' => (float) $device->ram_gb,
                    'gpu' => $this->evaluateGpuScore($device->gpu, $device->is_dedicated_gpu),
                    'display' => $this->evaluateDisplayScore($device->display, $device->color_gamut),
                    'weight' => max(0.8, (float) $device->weight_kg),
                ],
            ];
        });

        // 4. Cari Nilai Ekstrem (Min & Max) untuk Normalisasi Matriks R
        $minPrice = $scoredCandidates->min('raw.price') ?: 1;
        $maxCpu = $scoredCandidates->max('raw.cpu') ?: 1;
        $maxRam = $scoredCandidates->max('raw.ram') ?: 1;
        $maxGpu = $scoredCandidates->max('raw.gpu') ?: 1;
        $maxDisplay = $scoredCandidates->max('raw.display') ?: 1;
        $minWeight = $scoredCandidates->min('raw.weight') ?: 1;

        // 5. Normalisasi & Perhitungan Nilai Preferensi SAW (V)
        $ranked = $scoredCandidates->map(function ($item) use (
            $weights,
            $minPrice,
            $maxCpu,
            $maxRam,
            $maxGpu,
            $maxDisplay,
            $minWeight
        ) {
            $raw = $item['raw'];

            // Normalisasi Kriteria
            // Cost criteria: min / x
            $rPrice = $minPrice / max(1, $raw['price']);
            $rWeight = $minWeight / max(0.1, $raw['weight']);

            // Benefit criteria: x / max
            $rCpu = $raw['cpu'] / max(1, $maxCpu);
            $rRam = $raw['ram'] / max(1, $maxRam);
            $rGpu = $raw['gpu'] / max(1, $maxGpu);
            $rDisplay = $raw['display'] / max(1, $maxDisplay);

            // Hitung V = Sum(w_j * r_ij)
            $score = 0.0;
            $score += ($weights['PRICE'] ?? 0.20) * $rPrice;
            $score += ($weights['CPU'] ?? 0.25) * $rCpu;
            $score += ($weights['RAM'] ?? 0.20) * $rRam;
            $score += ($weights['GPU'] ?? 0.15) * $rGpu;
            $score += ($weights['DISPLAY'] ?? 0.10) * $rDisplay;
            $score += ($weights['WEIGHT'] ?? 0.10) * $rWeight;

            // Skala 0 - 100%
            $matchScore = round($score * 100, 1);
            if ($matchScore > 99.5) {
                $matchScore = 98.9; // realistic ceiling
            }

            return [
                'device' => $item['device'],
                'match_score' => $matchScore,
                'normalized_metrics' => [
                    'price_efficiency' => round($rPrice * 100, 1),
                    'cpu_performance' => round($rCpu * 100, 1),
                    'ram_capacity' => round($rRam * 100, 1),
                    'gpu_power' => round($rGpu * 100, 1),
                    'display_quality' => round($rDisplay * 100, 1),
                    'portability' => round($rWeight * 100, 1),
                ],
            ];
        })
        ->sortByDesc('match_score')
        ->values();

        // 6. Format Hasil Rekomendasi Top-N & Generate Explainability (Reasoning)
        $topRecommendations = $ranked->take($limit)->map(function ($item, $index) use ($category) {
            /** @var Device $device */
            $device = $item['device'];

            return [
                'rank' => $index + 1,
                'match_score' => $item['match_score'],
                'reasoning' => $this->generateReasoning($device, $category, $item['match_score']),
                'metrics' => $item['normalized_metrics'],
                'device' => [
                    'id' => $device->id,
                    'brand' => $device->brand_name,
                    'model_name' => $device->model_name,
                    'device_type' => $device->device_type,
                    'processor' => $device->processor,
                    'gpu' => $device->gpu,
                    'is_dedicated_gpu' => $device->is_dedicated_gpu,
                    'ram_gb' => $device->ram_gb,
                    'is_upgradeable_ram' => $device->is_upgradeable_ram,
                    'storage' => $device->storage,
                    'display' => $device->display,
                    'color_gamut' => $device->color_gamut,
                    'weight_kg' => $device->weight_kg,
                    'price_idr' => $device->price_idr,
                    'formatted_price' => 'Rp ' . number_format($device->price_idr, 0, ',', '.'),
                    'purchase_platform' => $device->purchase_platform,
                    'warranty' => $device->warranty,
                    'pros' => $device->pros,
                    'cons' => $device->cons,
                    'usecase_tags' => $device->usecase_tags,
                ],
            ];
        });

        return [
            'selected_persona' => [
                'id' => $category->id,
                'name' => $category->name,
                'computing_profile' => $category->computing_profile,
                'target_persona' => $category->target_persona,
                'budget_range' => $category->budget_range,
            ],
            'total_candidates_analyzed' => $candidates->count(),
            'total_recommendations' => $topRecommendations->count(),
            'top_recommendations' => $topRecommendations,
        ];
    }

    /**
     * Resolusi bobot kriteria berdasarkan Persona dan Prioritas Tambahan.
     */
    protected function resolveCriteriaWeights(Category $category, string $priorityFocus): array
    {
        $weights = [];
        foreach ($category->criteriaWeights as $cw) {
            $weights[$cw->criterion_code] = (float) $cw->weight;
        }

        // Default baseline jika belum terisi
        $defaultWeights = [
            'PRICE' => 0.20,
            'CPU' => 0.25,
            'RAM' => 0.20,
            'GPU' => 0.15,
            'DISPLAY' => 0.10,
            'WEIGHT' => 0.10,
        ];

        $weights = array_merge($defaultWeights, $weights);

        // Penyesuaian dinamis berdasarkan prioritas pengguna
        switch ($priorityFocus) {
            case 'performance':
                $weights['CPU'] += 0.10;
                $weights['GPU'] += 0.05;
                $weights['PRICE'] = max(0.05, $weights['PRICE'] - 0.10);
                break;
            case 'budget':
                $weights['PRICE'] += 0.15;
                $weights['CPU'] = max(0.10, $weights['CPU'] - 0.05);
                $weights['GPU'] = max(0.05, $weights['GPU'] - 0.05);
                break;
            case 'display':
                $weights['DISPLAY'] += 0.15;
                $weights['PRICE'] = max(0.05, $weights['PRICE'] - 0.05);
                $weights['WEIGHT'] = max(0.05, $weights['WEIGHT'] - 0.05);
                break;
            case 'portability':
                $weights['WEIGHT'] += 0.15;
                $weights['CPU'] = max(0.10, $weights['CPU'] - 0.05);
                $weights['GPU'] = max(0.05, $weights['GPU'] - 0.05);
                break;
        }

        // Normalisasi total bobot agar tepat bernilai 1.0
        $sum = array_sum($weights);
        if ($sum > 0) {
            foreach ($weights as $k => $v) {
                $weights[$k] = $v / $sum;
            }
        }

        return $weights;
    }

    /**
     * Skoring heuristik performa CPU (1-100).
     */
    protected function evaluateCpuScore(string $cpu): float
    {
        $c = strtolower($cpu);
        if (str_contains($c, 'ultra 9') || str_contains($c, 'i9') || str_contains($c, 'ryzen 9') || str_contains($c, 'm3 max')) {
            return 98.0;
        }
        if (str_contains($c, 'ultra 7') || str_contains($c, 'i7-13') || str_contains($c, 'i7-14') || str_contains($c, 'ryzen 7 7') || str_contains($c, 'ryzen 7 8') || str_contains($c, 'm3 pro') || str_contains($c, 'm2 pro')) {
            return 90.0;
        }
        if (str_contains($c, 'i7') || str_contains($c, 'ryzen 7') || str_contains($c, 'm3') || str_contains($c, 'm2')) {
            return 85.0;
        }
        if (str_contains($c, 'ultra 5') || str_contains($c, 'i5-13') || str_contains($c, 'i5-14') || str_contains($c, 'ryzen 5 7') || str_contains($c, 'ryzen 5 8')) {
            return 82.0;
        }
        if (str_contains($c, 'i5') || str_contains($c, 'ryzen 5') || str_contains($c, 'm1')) {
            return 75.0;
        }
        if (str_contains($c, 'i3') || str_contains($c, 'ryzen 3')) {
            return 62.0;
        }
        if (str_contains($c, 'n100') || str_contains($c, 'n200') || str_contains($c, 'celeron') || str_contains($c, 'athlon')) {
            return 45.0;
        }

        return 65.0;
    }

    /**
     * Skoring heuristik kartu grafis GPU (1-100).
     */
    protected function evaluateGpuScore(string $gpu, bool $isDedicated): float
    {
        $g = strtolower($gpu);
        if (str_contains($g, '4080') || str_contains($g, '4090')) {
            return 99.0;
        }
        if (str_contains($g, '4070') || str_contains($g, 'rx 7700')) {
            return 92.0;
        }
        if (str_contains($g, '4060') || str_contains($g, 'rx 7600') || str_contains($g, '3070')) {
            return 86.0;
        }
        if (str_contains($g, '4050') || str_contains($g, '3060') || str_contains($g, 'rx 6600')) {
            return 78.0;
        }
        if (str_contains($g, '3050') || str_contains($g, '2050') || str_contains($g, 'gtx 1650')) {
            return 70.0;
        }
        if (str_contains($g, 'arc') || str_contains($g, '780m') || str_contains($g, '680m') || str_contains($g, 'apple 10-core')) {
            return 65.0;
        }
        if (str_contains($g, 'iris xe') || str_contains($g, 'radeon 610m') || str_contains($g, 'vega')) {
            return 52.0;
        }

        return $isDedicated ? 70.0 : 42.0;
    }

    /**
     * Skoring heuristik kualitas layar dan akurasi warna (1-100).
     */
    protected function evaluateDisplayScore(?string $display, ?string $colorGamut): float
    {
        $str = strtolower(($display ?? '') . ' ' . ($colorGamut ?? ''));
        if (str_contains($str, 'oled') || str_contains($str, 'dci-p3') || str_contains($str, 'retina')) {
            return 95.0;
        }
        if (str_contains($str, '100% srgb') || str_contains($str, '100% s-rgb')) {
            return 85.0;
        }
        if (str_contains($str, 'ips') && (str_contains($str, '144hz') || str_contains($str, '165hz'))) {
            return 80.0;
        }
        if (str_contains($str, 'ips')) {
            return 70.0;
        }
        if (str_contains($str, 'ntsc') || str_contains($str, '45%')) {
            return 55.0;
        }

        return 60.0;
    }

    /**
     * Generator kalimat penjelasan ilmiah (Explainable AI/SPK).
     */
    protected function generateReasoning(Device $device, Category $category, float $score): string
    {
        $reasons = [];

        if ($device->ram_gb >= 16) {
            $reasons[] = "Kapasitas RAM {$device->ram_gb}GB sangat leluasa";
        }
        if ($device->is_upgradeable_ram) {
            $reasons[] = 'RAM dapat di-upgrade di kemudian hari';
        }
        if ($device->is_dedicated_gpu) {
            $reasons[] = "Didukung kartu grafis discrete {$device->gpu}";
        }
        if ($device->weight_kg <= 1.4) {
            $reasons[] = "Bobot ultra-ringkas ({$device->weight_kg} kg) mudah dibawa ke kampus/kantor";
        }
        if ($device->color_gamut && str_contains($device->color_gamut, 'sRGB')) {
            $reasons[] = 'Panel layar dengan akurasi warna tajam';
        }

        $reasonText = !empty($reasons)
            ? implode(', ', array_slice($reasons, 0, 2)) . '.'
            : 'Menawarkan rasio spesifikasi dan harga optimal.';

        return "Peringkat tinggi untuk kebutuhan {$category->name} dengan kecocokan {$score}%. {$reasonText}";
    }
}
