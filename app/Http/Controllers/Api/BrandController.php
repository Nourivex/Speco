<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    /**
     * Daftar seluruh produsen/brand laptop beserta jumlah katalog.
     */
    public function index(): JsonResponse
    {
        $brands = Brand::orderByDesc('device_count')->get()->map(fn ($b) => [
            'id' => $b->id,
            'name' => $b->name,
            'slug' => $b->slug,
            'device_count' => $b->device_count,
        ]);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Daftar brand berhasil diambil',
            'data' => $brands,
            'meta' => [
                'system_name' => config('brand.name'),
                'total_brands' => $brands->count(),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }
}
