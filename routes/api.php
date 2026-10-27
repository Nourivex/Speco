<?php

use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ComparisonController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\RecommendationController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| CariSpek RESTful API Routes (v1)
| Single Source of Truth Branding via config('brand')
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Dynamic Brand Configuration
    Route::get('/config', function () {
        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Konfigurasi sistem berhasil dimuat',
            'data' => [
                'app_name' => config('brand.name'),
                'brand_name' => config('brand.name'),
                'tagline' => config('brand.tagline'),
                'organization' => config('brand.organization'),
                'logo_url' => config('brand.logo_url'),
                'favicon_url' => config('brand.favicon_url'),
                'support_email' => config('brand.support_email'),
            ],
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
                'version' => 'v1.0',
            ],
        ]);
    });

    // 2. Healthcheck & Database Connection Status
    Route::get('/health', function () {
        $dbStatus = 'disconnected';
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Throwable $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => 'Backend service sehat dan beroperasi normal',
            'data' => [
                'environment' => config('app.env'),
                'database' => $dbStatus,
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ],
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    });

    // 3. Categories / Persona Endpoints
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    // 4. Brands Endpoint
    Route::get('/brands', [BrandController::class, 'index']);

    // 5. Devices & Catalog Endpoints
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::get('/devices/{id}', [DeviceController::class, 'show']);

    // 6. Core SPK Engine (SAW Recommendation)
    Route::post('/recommendations', [RecommendationController::class, 'calculate']);

    // 7. Comparison Matrix Endpoint
    Route::post('/compare', [ComparisonController::class, 'compare']);
});
