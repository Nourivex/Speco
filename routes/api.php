<?php

use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ComparisonController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\FrontendIntegrationController;
use App\Http\Controllers\Api\RecommendationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| CariSpek RESTful API Routes (v1 & Headless Frontend Integration)
| Single Source of Truth Branding via config('brand')
|--------------------------------------------------------------------------
*/

$registerRoutes = function () {
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

    // 3. Frontend Next.js Headless Integration Endpoints (docs/BACKEND.md)
    Route::post('/requirements', [FrontendIntegrationController::class, 'requirements']);
    Route::get('/laptops', [FrontendIntegrationController::class, 'laptops']);
    Route::get('/laptops/{slug}', [FrontendIntegrationController::class, 'laptopDetail']);

    // Recommendations: Mendukung format Next.js UserProfile maupun envelope REST
    Route::post('/recommendations', function (Request $request) {
        if ($request->has('budget.max') || $request->has('activities') || $request->has('primaryActivity')) {
            return app(FrontendIntegrationController::class)->recommendations($request);
        }
        return app(RecommendationController::class)->calculate(
            app(\App\Http\Requests\RecommendationRequest::class)
        );
    });

    // 4. Standard Categories / Personas Endpoints
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    // 5. Brands Endpoint
    Route::get('/brands', [BrandController::class, 'index']);

    // 6. Devices & Catalog Endpoints
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::get('/devices/{id}', [DeviceController::class, 'show']);

    // 7. Comparison Matrix Endpoint
    Route::post('/compare', [ComparisonController::class, 'compare']);
};

// Daftarkan di /api/v1/* dan /api/* untuk kompatibilitas penuh
Route::prefix('v1')->group($registerRoutes);
$registerRoutes();
