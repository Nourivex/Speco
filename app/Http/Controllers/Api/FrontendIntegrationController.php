<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Services\LaptopTransformer;
use App\Services\SawRecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrontendIntegrationController extends Controller
{
    public function __construct(
        protected SawRecommendationService $sawService
    ) {}

    /**
     * POST /api/v1/requirements
     * Mengembalikan Profil Kebutuhan (RequirementProfile) berdasarkan UserProfile kuesioner.
     */
    public function requirements(Request $request): JsonResponse
    {
        $major = $request->input('major', 'informatika');
        $budgetMax = (int) ($request->input('budget.max') ?? 10000000);
        $persona = $this->resolvePersonaForMajor($major);
        $tier = $this->resolveBudgetTier($budgetMax);

        $specRequirements = $this->buildSpecsRequirements($persona, $tier);
        $warnings = $this->buildWarnings($persona, $budgetMax);
        $checks = $this->buildChecks($persona, $tier);

        return response()->json([
            'id' => "req-{$persona}-{$tier}",
            'persona' => $persona,
            'budgetTier' => $tier,
            'summary' => "Kebutuhan utama untuk {$persona} dengan budget kisaran Rp " . number_format($budgetMax, 0, ',', '.') . ".",
            'specs' => $specRequirements,
            'warnings' => $warnings,
            'checks' => $checks,
            'character' => [
                'performa' => $persona === 'teknik' || $persona === 'desain' ? 3 : 2,
                'mobilitas' => $persona === 'umum' || $persona === 'profesional' ? 3 : 2,
            ],
            'isMock' => false,
        ]);
    }

    /**
     * POST /api/v1/recommendations
     * Menjalankan kalkulasi SPK SAW dan mengembalikan RecommendationSet sesuai kontrak Next.js types.
     */
    public function recommendations(Request $request): JsonResponse
    {
        $profile = $request->all();
        $major = $request->input('major', 'informatika');
        $budgetMin = (int) ($request->input('budget.min') ?? 0);
        $budgetMax = (int) ($request->input('budget.max') ?? 15000000);
        $flexible = (bool) ($request->input('budget.flexible') ?? true);
        $hardFilters = $request->input('hardFilters', []);

        $categoryId = $this->mapMajorToCategoryId($major);

        $params = [
            'category_id' => $categoryId,
            'budget_min' => $budgetMin,
            'budget_max' => $budgetMax,
            'priority_focus' => $this->resolvePriorityFocus($request->input('priorities', [])),
            'require_upgradeable_ram' => in_array('ram-upgrade', $hardFilters),
            'require_dedicated_gpu' => in_array('gpu-dedicated', $hardFilters),
            'limit' => 10,
        ];

        $sawResult = $this->sawService->recommend($params);
        $persona = $this->resolvePersonaForMajor($major);

        $items = [];
        $rank = 0;

        foreach ($sawResult['top_recommendations'] as $rec) {
            $deviceModel = Device::find($rec['device']['id']);
            if (!$deviceModel) continue;

            $rank++;
            $laptop = LaptopTransformer::toFrontendLaptop($deviceModel);
            $matchScore = (int) round($rec['match_score']);

            // Kategori rekomendasi (Best Match, Best Performance, etc.)
            $category = null;
            $categoryReason = null;
            if ($rank === 1) {
                $category = 'best-match';
                $categoryReason = 'Skor keseluruhan tertinggi untuk kebutuhan dan budgetmu.';
            } elseif ($deviceModel->is_dedicated_gpu && $rank <= 3) {
                $category = 'best-performance';
                $categoryReason = 'Performa grafis dan komputasi paling bertenaga.';
            } elseif ($deviceModel->price_idr < ($budgetMax * 0.85)) {
                $category = 'best-value';
                $categoryReason = 'Pilihan paling hemat dengan spesifikasi mumpuni.';
            } elseif ($deviceModel->weight_kg <= 1.35) {
                $category = 'lightest';
                $categoryReason = 'Paling ringan dan ringkas untuk dibawa mobilitas.';
            }

            // Subscores (0-100)
            $subScores = [
                'performance' => min(100, (int) round($rec['metrics']['cpu_performance'] * 0.9 + $rec['metrics']['gpu_power'] * 0.1)),
                'value' => min(100, (int) round($rec['metrics']['price_efficiency'])),
                'portability' => min(100, (int) round($rec['metrics']['portability'])),
                'budgetFit' => $deviceModel->price_idr <= $budgetMax ? 96 : 82,
            ];

            // Breakdown kriteria yang Σ bobot = 100
            $breakdown = [
                ['criterion' => 'performa', 'weight' => 30, 'score' => min(100, (int) $rec['metrics']['cpu_performance'])],
                ['criterion' => 'ram', 'weight' => 25, 'score' => min(100, (int) $rec['metrics']['ram_capacity'])],
                ['criterion' => 'budget', 'weight' => 20, 'score' => min(100, (int) $rec['metrics']['price_efficiency'])],
                ['criterion' => 'layar', 'weight' => 15, 'score' => min(100, (int) $rec['metrics']['display_quality'])],
                ['criterion' => 'portabilitas', 'weight' => 10, 'score' => min(100, (int) $rec['metrics']['portability'])],
            ];

            // Reasons & Trade-offs
            $reasons = [
                ['text' => "Harga Rp " . number_format($deviceModel->price_idr, 0, ',', '.'), 'source' => "Sesuai anggaran pengguna (toleransi ±10%)"],
                ['text' => "RAM {$deviceModel->ram_gb} GB " . ($deviceModel->is_upgradeable_ram ? '(Upgradeable)' : ''), 'source' => 'Spesifikasi katalog riil'],
                ['text' => "Processor {$deviceModel->processor}", 'source' => 'Performa komputasi memadai untuk aktivitas harian'],
            ];

            $tradeOffs = [];
            if (!$deviceModel->is_upgradeable_ram) {
                $tradeOffs[] = ['text' => 'RAM disolder (on-board)', 'source' => 'Tidak bisa di-upgrade kapasitasnya'];
            }
            if (!$deviceModel->is_dedicated_gpu) {
                $tradeOffs[] = ['text' => 'GPU Integrated', 'source' => 'Kurang ideal untuk rendering 3D / gaming berat AAA'];
            }
            if (empty($tradeOffs)) {
                $tradeOffs[] = ['text' => 'Baterai kapasitas standar', 'source' => 'Daya tahan 5-7 jam kerja'];
            }

            $items[] = [
                'laptop' => $laptop,
                'result' => [
                    'laptopId' => $laptop['id'],
                    'matchScore' => $matchScore,
                    'category' => $category,
                    'categoryReason' => $categoryReason,
                    'summary' => $rec['reasoning'],
                    'subScores' => $subScores,
                    'breakdown' => $breakdown,
                    'reasons' => $reasons,
                    'tradeOffs' => $tradeOffs,
                ],
            ];
        }

        return response()->json([
            'scenarioId' => "saw-{$persona}-" . time(),
            'persona' => $persona,
            'personaName' => ucfirst($persona),
            'title' => "Rekomendasi Cerdas untuk Jurusan " . ucfirst($major),
            'profile' => $profile,
            'items' => $items,
            'isMock' => false,
        ]);
    }

    /**
     * GET /api/v1/laptops/:slug
     * Mengambil satu laptop berdasarkan slug atau ID.
     */
    public function laptopDetail(string $slug): JsonResponse
    {
        // Cari berdasarkan ID langsung (e.g. LP001) atau slug
        $device = Device::where('id', strtoupper($slug))
            ->orWhere('id', strtolower($slug))
            ->first();

        if (!$device) {
            // Coba cari dari slug
            $devices = Device::all();
            foreach ($devices as $d) {
                if (LaptopTransformer::generateSlug($d) === $slug) {
                    $device = $d;
                    break;
                }
            }
        }

        if (!$device) {
            return response()->json(['message' => 'Laptop tidak ditemukan'], 404);
        }

        return response()->json(LaptopTransformer::toFrontendLaptop($device));
    }

    /**
     * GET /api/v1/laptops
     * Mengambil daftar laptop (opsional filter `?ids=lp001,lp002`).
     */
    public function laptops(Request $request): JsonResponse
    {
        $idsParam = $request->input('ids');
        if ($idsParam) {
            $ids = array_map('trim', explode(',', $idsParam));
            $devices = Device::whereIn('id', array_map('strtoupper', $ids))
                ->orWhereIn('id', array_map('strtolower', $ids))
                ->get();
            $transformed = $devices->map(fn ($d) => LaptopTransformer::toFrontendLaptop($d));
            return response()->json($transformed);
        }

        $query = Device::query();
        if ($request->filled('brand')) {
            $query->where('brand_name', $request->input('brand'));
        }
        if ($request->filled('max_price')) {
            $query->where('price_idr', '<=', (int) $request->input('max_price'));
        }

        $devices = $query->take(50)->get();
        $transformed = $devices->map(fn ($d) => LaptopTransformer::toFrontendLaptop($d));

        return response()->json($transformed);
    }

    // ---------------------------------------------------------------- Helper Resolusi

    protected function resolvePersonaForMajor(string $major): string
    {
        return match ($major) {
            'informatika', 'sistem-informasi', 'data-science', 'teknik' => 'teknik',
            'dkv', 'arsitektur' => 'desain',
            'bisnis', 'akuntansi' => 'profesional',
            default => 'umum',
        };
    }

    protected function resolveBudgetTier(int $budget): string
    {
        if ($budget < 6000000) return 'lt-6';
        if ($budget <= 8000000) return '6-8';
        if ($budget <= 10000000) return '8-10';
        if ($budget <= 15000000) return '10-15';
        return '15-plus';
    }

    protected function mapMajorToCategoryId(string $major): string
    {
        return match ($major) {
            'informatika', 'sistem-informasi', 'data-science' => 'CAT-02',
            'dkv', 'arsitektur' => 'CAT-03',
            'teknik' => 'CAT-04',
            'bisnis', 'akuntansi' => 'CAT-07',
            default => 'CAT-01',
        };
    }

    protected function resolvePriorityFocus(array $priorities): string
    {
        if (empty($priorities)) return 'balanced';
        $first = $priorities[0]['criterion'] ?? 'performa';
        return match ($first) {
            'performa' => 'performance',
            'budget' => 'budget',
            'layar' => 'display',
            'portabilitas' => 'portability',
            default => 'balanced',
        };
    }

    protected function buildSpecsRequirements(string $persona, string $tier): array
    {
        if ($persona === 'teknik') {
            return [
                ['component' => 'cpu', 'minimum' => 'Ryzen 5 / Core i5 6-Core', 'level' => 'wajib', 'reason' => 'VS Code, Docker, dan compile butuh multi-core'],
                ['component' => 'ram', 'minimum' => '16 GB', 'level' => 'wajib', 'reason' => 'Banyak tab browser + IDE + Docker berjalan serentak'],
                ['component' => 'storage', 'minimum' => 'SSD 512 GB', 'level' => 'wajib', 'reason' => 'Proyek, SDK, dan environment dev memakan ruang besar'],
                ['component' => 'gpu', 'minimum' => 'Integrated cukup (Iris Xe / Radeon)', 'level' => 'opsional', 'reason' => 'Coding tidak menuntut GPU discrete'],
                ['component' => 'layar', 'minimum' => 'IPS Full HD', 'level' => 'disarankan', 'reason' => 'Kenyamanan mata saat menatap baris kode berjam-jam'],
                ['component' => 'baterai', 'minimum' => '50 Wh ke atas', 'level' => 'disarankan', 'reason' => 'Daya tahan di ruang kuliah dan lab'],
            ];
        }

        if ($persona === 'desain') {
            return [
                ['component' => 'layar', 'minimum' => '100% sRGB / DCI-P3 OLED', 'level' => 'wajib', 'reason' => 'Akurasi warna wajib untuk cetak dan export aset desain'],
                ['component' => 'gpu', 'minimum' => 'Dedicated GPU (RTX 3050/4050)', 'level' => 'wajib', 'reason' => 'Akselerasi hardware Adobe Premiere & Blender'],
                ['component' => 'cpu', 'minimum' => 'Core i5/i7 H-Series atau Ryzen 7', 'level' => 'wajib', 'reason' => 'Kecepatan rendering timeline video & export gambar'],
                ['component' => 'ram', 'minimum' => '16 GB', 'level' => 'wajib', 'reason' => 'Photoshop + Illustrator membuka canvas resolusi tinggi'],
                ['component' => 'storage', 'minimum' => 'SSD 512 GB - 1 TB', 'level' => 'disarankan', 'reason' => 'Asset pack dan footage video berukuran raksasa'],
                ['component' => 'baterai', 'minimum' => '55 Wh ke atas', 'level' => 'opsional', 'reason' => 'Sering terhubung charger saat rendering aktif'],
            ];
        }

        return [
            ['component' => 'cpu', 'minimum' => 'Core i3 / Ryzen 3 Quad-Core', 'level' => 'wajib', 'reason' => 'Office, browsing, Zoom meeting berjalan mulus'],
            ['component' => 'ram', 'minimum' => '8 - 16 GB', 'level' => 'wajib', 'reason' => 'Multitasking dokumen dan spreadsheet lancar'],
            ['component' => 'storage', 'minimum' => 'SSD 256 - 512 GB', 'level' => 'wajib', 'reason' => 'Booting Windows dan buka aplikasi cepat'],
            ['component' => 'layar', 'minimum' => 'IPS Anti-Glare 14 inci', 'level' => 'disarankan', 'reason' => 'Mata tidak cepat lelah saat membaca artikel & skripsi'],
            ['component' => 'baterai', 'minimum' => '45 Wh', 'level' => 'disarankan', 'reason' => 'Cukup untuk sesi kuliah seharian'],
        ];
    }

    protected function buildWarnings(string $persona, int $budget): array
    {
        $warnings = [];
        if ($persona === 'desain' && $budget < 10000000) {
            $warnings[] = [
                'id' => 'budget-desain-tight',
                'message' => 'Budget di bawah Rp 10 Juta untuk Desain/Kreatif',
                'detail' => 'Laptop di rentang harga ini umumnya memiliki layar 45% NTSC dan GPU terintegrasi.',
                'actions' => [
                    ['label' => 'Naikkan budget ke Rp 10 Jt+', 'kind' => 'raise-budget', 'targetBudget' => 10500000],
                    ['label' => 'Tetap cari layar akurat di harga ini', 'kind' => 'compromise'],
                ],
                'compromiseNote' => 'Sistem akan memprioritaskan laptop dengan layar 100% sRGB meski menggunakan CPU seri hemat daya.',
            ];
        }

        return $warnings;
    }

    protected function buildChecks(string $persona, string $tier): array
    {
        if ($persona === 'teknik') {
            return [
                'ram' => ['metric' => 'ramGb', 'min' => 16],
                'storage' => ['metric' => 'storageGb', 'min' => 512],
                'cpu' => ['metric' => 'cpuBench', 'min' => 70],
            ];
        }

        if ($persona === 'desain') {
            return [
                'ram' => ['metric' => 'ramGb', 'min' => 16],
                'srgb' => ['metric' => 'srgbPercent', 'min' => 95],
                'gpu' => ['metric' => 'gpuDedicated', 'min' => 1],
            ];
        }

        return [
            'ram' => ['metric' => 'ramGb', 'min' => 8],
            'storage' => ['metric' => 'storageGb', 'min' => 256],
        ];
    }
}
