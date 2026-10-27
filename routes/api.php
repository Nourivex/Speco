<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Dynamic Brand & System Configuration
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

    // Healthcheck & Database Connection Status
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
});
