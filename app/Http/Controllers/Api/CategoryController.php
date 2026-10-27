<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Ambil 7 Persona dan Matriks Kebutuhan Komputasi Mahasiswa.
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('criteriaWeights')->get()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'computing_profile' => $cat->computing_profile,
                'min_cpu' => $cat->min_cpu,
                'min_ram' => $cat->min_ram,
                'min_gpu' => $cat->min_gpu,
                'min_display' => $cat->min_display,
                'budget_range' => $cat->budget_range,
                'min_budget' => $cat->min_budget,
                'max_budget' => $cat->max_budget,
                'target_persona' => $cat->target_persona,
                'key_features' => $cat->key_features,
                'device_count' => $cat->devices()->count(),
                'criteria_weights' => $cat->criteriaWeights->map(fn ($w) => [
                    'code' => $w->criterion_code,
                    'name' => $w->criterion_name,
                    'type' => $w->criterion_type,
                    'weight' => $w->weight,
                ]),
            ];
        });

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Daftar kategori persona usecase berhasil diambil',
            'data' => $categories,
            'meta' => [
                'system_name' => config('brand.name'),
                'total_categories' => $categories->count(),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Detail satu kategori persona.
     */
    public function show(string $id): JsonResponse
    {
        $cat = Category::with(['criteriaWeights', 'devices' => fn ($q) => $q->take(5)])->find($id);

        if (!$cat) {
            return response()->json([
                'success' => false,
                'status_code' => 404,
                'message' => 'Kategori persona tidak ditemukan',
                'meta' => [
                    'system_name' => config('brand.name'),
                    'timestamp' => now()->toISOString(),
                ],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Detail kategori persona berhasil diambil',
            'data' => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'computing_profile' => $cat->computing_profile,
                'min_cpu' => $cat->min_cpu,
                'min_ram' => $cat->min_ram,
                'min_gpu' => $cat->min_gpu,
                'min_display' => $cat->min_display,
                'budget_range' => $cat->budget_range,
                'min_budget' => $cat->min_budget,
                'max_budget' => $cat->max_budget,
                'target_persona' => $cat->target_persona,
                'key_features' => $cat->key_features,
                'criteria_weights' => $cat->criteriaWeights->map(fn ($w) => [
                    'code' => $w->criterion_code,
                    'name' => $w->criterion_name,
                    'type' => $w->criterion_type,
                    'weight' => $w->weight,
                ]),
                'sample_devices' => $cat->devices->map(fn ($d) => [
                    'id' => $d->id,
                    'brand' => $d->brand_name,
                    'model_name' => $d->model_name,
                    'price_idr' => $d->price_idr,
                    'processor' => $d->processor,
                    'ram_gb' => $d->ram_gb,
                ]),
            ],
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }
}
