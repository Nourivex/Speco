<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComparisonRequest;
use App\Models\Device;
use Illuminate\Http\JsonResponse;

class ComparisonController extends Controller
{
    /**
     * Komparasi 2 sampai 4 laptop head-to-head.
     */
    public function compare(ComparisonRequest $request): JsonResponse
    {
        $deviceIds = $request->validated('device_ids');

        $devices = Device::whereIn('id', $deviceIds)->get();

        if ($devices->isEmpty()) {
            return response()->json([
                'success' => false,
                'status_code' => 404,
                'message' => 'Perangkat yang dipilih tidak ditemukan',
                'meta' => [
                    'system_name' => config('brand.name'),
                    'timestamp' => now()->toISOString(),
                ],
            ], 404);
        }

        // Susun matriks perbandingan
        $comparison = [
            'devices' => $devices->map(fn ($d) => [
                'id' => $d->id,
                'brand' => $d->brand_name,
                'model_name' => $d->model_name,
                'full_title' => "{$d->brand_name} {$d->model_name}",
                'device_type' => $d->device_type,
                'price_idr' => $d->price_idr,
                'formatted_price' => 'Rp ' . number_format($d->price_idr, 0, ',', '.'),
                'processor' => $d->processor,
                'gpu' => $d->gpu,
                'is_dedicated_gpu' => $d->is_dedicated_gpu,
                'ram_gb' => $d->ram_gb,
                'is_upgradeable_ram' => $d->is_upgradeable_ram,
                'storage' => $d->storage,
                'display' => $d->display,
                'weight_kg' => $d->weight_kg,
                'pros' => $d->pros,
                'cons' => $d->cons,
                'purchase_platform' => $d->purchase_platform,
            ]),
            'spec_comparison' => [
                'price' => [
                    'label' => 'Harga Pasar',
                    'values' => $devices->pluck('price_idr', 'id'),
                    'cheapest_id' => $devices->sortBy('price_idr')->first()?->id,
                ],
                'ram' => [
                    'label' => 'Kapasitas RAM',
                    'values' => $devices->pluck('ram_gb', 'id'),
                    'highest_id' => $devices->sortByDesc('ram_gb')->first()?->id,
                ],
                'weight' => [
                    'label' => 'Bobot (kg)',
                    'values' => $devices->pluck('weight_kg', 'id'),
                    'lightest_id' => $devices->sortBy('weight_kg')->first()?->id,
                ],
                'gpu' => [
                    'label' => 'Kartu Grafis',
                    'values' => $devices->pluck('gpu', 'id'),
                ],
                'processor' => [
                    'label' => 'Processor',
                    'values' => $devices->pluck('processor', 'id'),
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Komparasi perangkat berhasil dikalkulasi',
            'data' => $comparison,
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }
}
