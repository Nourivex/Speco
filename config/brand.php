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
    'name' => env('BRAND_NAME', 'CariSpek'),
    'tagline' => env('BRAND_TAGLINE', 'Sistem Rekomendasi & Pemilihan Laptop Cerdas Berbasis Kebutuhan & Budget'),
    'organization' => env('BRAND_ORGANIZATION', 'NEXORA Kelompok 7A'),
    'logo_url' => env('BRAND_LOGO_URL', '/assets/images/logo.svg'),
    'favicon_url' => env('BRAND_FAVICON_URL', '/assets/images/favicon.ico'),
    'support_email' => env('BRAND_SUPPORT_EMAIL', 'support@nexora.local'),
];
