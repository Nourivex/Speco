<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Device extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'category_id',
        'category_name',
        'target_major',
        'brand_id',
        'brand_name',
        'model_name',
        'device_type',
        'processor',
        'gpu',
        'is_dedicated_gpu',
        'ram_gb',
        'is_upgradeable_ram',
        'storage',
        'storage_gb',
        'display',
        'color_gamut',
        'weight_kg',
        'price_idr',
        'purchase_platform',
        'warranty',
        'usecase_tags',
        'image_url',
        'pros',
        'cons',
    ];

    protected $casts = [
        'is_dedicated_gpu' => 'boolean',
        'is_upgradeable_ram' => 'boolean',
        'ram_gb' => 'float',
        'weight_kg' => 'float',
        'price_idr' => 'integer',
        'storage_gb' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['category_id'] ?? null, fn ($q, $cat) => $q->where('category_id', $cat))
            ->when($filters['brand'] ?? null, fn ($q, $brand) => $q->where('brand_name', $brand))
            ->when($filters['device_type'] ?? null, fn ($q, $type) => $q->where('device_type', $type))
            ->when($filters['min_price'] ?? null, fn ($q, $min) => $q->where('price_idr', '>=', (int) $min))
            ->when($filters['max_price'] ?? null, fn ($q, $max) => $q->where('price_idr', '<=', (int) $max))
            ->when($filters['min_ram'] ?? null, fn ($q, $ram) => $q->where('ram_gb', '>=', (float) $ram))
            ->when($filters['upgradeable_only'] ?? false, fn ($q) => $q->where('is_upgradeable_ram', true))
            ->when($filters['dedicated_gpu_only'] ?? false, fn ($q) => $q->where('is_dedicated_gpu', true))
            ->when($filters['q'] ?? null, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('model_name', 'like', "%{$search}%")
                        ->orWhere('brand_name', 'like', "%{$search}%")
                        ->orWhere('processor', 'like', "%{$search}%")
                        ->orWhere('gpu', 'like', "%{$search}%")
                        ->orWhere('usecase_tags', 'like', "%{$search}%");
                });
            });
    }
}
