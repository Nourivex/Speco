<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecommendationRequest;
use App\Services\SawRecommendationService;
use Illuminate\Http\JsonResponse;

class RecommendationController extends Controller
{
    public function __construct(
        protected SawRecommendationService $sawService
    ) {}

    /**
     * Mesin Rekomendasi Utama SPK CariSpek (Algoritma SAW).
     */
    public function calculate(RecommendationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $result = $this->sawService->recommend($validated);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Rekomendasi laptop berhasil dihitung dengan metode Simple Additive Weighting (SAW)',
            'data' => $result,
            'meta' => [
                'system_name' => config('brand.name'),
                'algorithm' => 'Simple Additive Weighting (SAW)',
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }
}
