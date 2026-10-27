<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CriteriaWeight extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'criterion_code',
        'criterion_name',
        'criterion_type',
        'weight',
    ];

    protected $casts = [
        'weight' => 'float',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
