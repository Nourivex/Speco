<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'computing_profile',
        'min_cpu',
        'min_ram',
        'min_gpu',
        'min_display',
        'budget_range',
        'min_budget',
        'max_budget',
        'target_persona',
        'key_features',
    ];

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    public function criteriaWeights(): HasMany
    {
        return $this->hasMany(CriteriaWeight::class);
    }
}
