<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Centralized Brand Configuration (Single Source of Truth)
    |--------------------------------------------------------------------------
    |
    | Seluruh penamaan produk, tagline, dan aset logo terpusat di sini
    | dan dikendalikan via environment variable (.env).
    |
    */
    'name' => env('BRAND_NAME', 'Speco'),
    'tagline' => env('BRAND_TAGLINE', 'Sistem Rekomendasi & Pemilihan Laptop Cerdas Berbasis Kebutuhan & Budget'),
    'organization' => env('BRAND_ORGANIZATION', 'NEXORA Kelompok 7A'),
    'logo_url' => env('BRAND_LOGO_URL', '/brand/speco-logo.png'),
    'logo_white_url' => env('BRAND_LOGO_WHITE_URL', '/brand/speco-logo-white.png'),
    'favicon_url' => env('BRAND_FAVICON_URL', '/icon.png'),
    'frontend_url' => env('FRONTEND_URL', 'https://speco.nour.web.id'),
    'support_email' => env('BRAND_SUPPORT_EMAIL', 'support@speco.nour.web.id'),
];
