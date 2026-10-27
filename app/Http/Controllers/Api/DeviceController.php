<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    /**
     * Mengambil katalog perangkat dengan filter dan pencarian komprehensif.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(50, max(5, (int) $request->input('per_page', 15)));
        $sortBy = $request->input('sort', 'price_asc');

        $query = Device::filter($request->all());

        // Pengurutan
        switch ($sortBy) {
            case 'price_desc':
                $query->orderByDesc('price_idr');
                break;
            case 'ram_desc':
                $query->orderByDesc('ram_gb');
                break;
            case 'weight_asc':
                $query->orderBy('weight_kg');
                break;
            case 'latest':
                $query->latest();
                break;
            case 'price_asc':
            default:
                $query->orderBy('price_idr');
                break;
        }

        $paginator = $query->paginate($perPage);

        $items = collect($paginator->items())->map(fn (Device $d) => [
            'id' => $d->id,
            'category_id' => $d->category_id,
            'category_name' => $d->category_name,
            'target_major' => $d->target_major,
            'brand' => $d->brand_name,
            'model_name' => $d->model_name,
            'device_type' => $d->device_type,
            'processor' => $d->processor,
            'gpu' => $d->gpu,
            'is_dedicated_gpu' => $d->is_dedicated_gpu,
            'ram_gb' => $d->ram_gb,
            'is_upgradeable_ram' => $d->is_upgradeable_ram,
            'storage' => $d->storage,
            'storage_gb' => $d->storage_gb,
            'display' => $d->display,
            'color_gamut' => $d->color_gamut,
            'weight_kg' => $d->weight_kg,
            'price_idr' => $d->price_idr,
            'formatted_price' => 'Rp ' . number_format($d->price_idr, 0, ',', '.'),
            'purchase_platform' => $d->purchase_platform,
            'warranty' => $d->warranty,
            'usecase_tags' => $d->usecase_tags,
            'pros' => $d->pros,
            'cons' => $d->cons,
        ]);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Katalog perangkat berhasil dimuat',
            'data' => $items,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total_items' => $paginator->total(),
                'total_pages' => $paginator->lastPage(),
                'has_next' => $paginator->hasMorePages(),
                'has_prev' => $paginator->currentPage() > 1,
            ],
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Detail spesifikasi lengkap satu perangkat.
     */
    public function show(string $id): JsonResponse
    {
        $device = Device::with(['category', 'brand'])->find($id);

        if (!$device) {
            return response()->json([
                'success' => false,
                'status_code' => 404,
                'message' => "Perangkat dengan ID '{$id}' tidak ditemukan",
                'meta' => [
                    'system_name' => config('brand.name'),
                    'timestamp' => now()->toISOString(),
                ],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Detail spesifikasi perangkat berhasil diambil',
            'data' => [
                'id' => $device->id,
                'category' => [
                    'id' => $device->category_id,
                    'name' => $device->category_name,
                    'target_major' => $device->target_major,
                ],
                'brand' => [
                    'id' => $device->brand_id,
                    'name' => $device->brand_name,
                ],
                'model_name' => $device->model_name,
                'full_title' => "{$device->brand_name} {$device->model_name}",
                'device_type' => $device->device_type,
                'specs' => [
                    'processor' => $device->processor,
                    'gpu' => $device->gpu,
                    'is_dedicated_gpu' => $device->is_dedicated_gpu,
                    'ram_gb' => $device->ram_gb,
                    'is_upgradeable_ram' => $device->is_upgradeable_ram,
                    'storage' => $device->storage,
                    'storage_gb' => $device->storage_gb,
                    'display' => $device->display,
                    'color_gamut' => $device->color_gamut,
                    'weight_kg' => $device->weight_kg,
                ],
                'market' => [
                    'price_idr' => $device->price_idr,
                    'formatted_price' => 'Rp ' . number_format($device->price_idr, 0, ',', '.'),
                    'purchase_platform' => $device->purchase_platform,
                    'warranty' => $device->warranty,
                ],
                'review' => [
                    'usecase_tags' => $device->usecase_tags,
                    'pros' => $device->pros,
                    'cons' => $device->cons,
                ],
            ],
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }
}
