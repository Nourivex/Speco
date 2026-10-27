<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }
    public function test_config_endpoint_returns_dynamic_branding(): void
    {
        $response = $this->getJson('/api/v1/config');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'brand_name' => config('brand.name'),
                    'tagline' => config('brand.tagline'),
                ],
            ]);
    }

    public function test_health_endpoint_reports_connected_database(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'database' => 'connected',
                ],
            ]);
    }

    public function test_categories_endpoint_returns_all_seven_personas(): void
    {
        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => [
                    'total_categories' => 7,
                ],
            ])
            ->assertJsonFragment(['id' => 'CAT-01'])
            ->assertJsonFragment(['id' => 'CAT-02'])
            ->assertJsonFragment(['id' => 'CAT-07']);
    }

    public function test_category_detail_returns_specific_persona(): void
    {
        $response = $this->getJson('/api/v1/categories/CAT-02');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => 'CAT-02',
                    'name' => 'Multitasking & Coding',
                ],
            ]);
    }

    public function test_brands_endpoint_returns_list_of_manufacturers(): void
    {
        $response = $this->getJson('/api/v1/brands');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonFragment(['name' => 'Lenovo'])
            ->assertJsonFragment(['name' => 'ASUS']);
    }

    public function test_devices_catalog_returns_paginated_list(): void
    {
        $response = $this->getJson('/api/v1/devices?per_page=10');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'pagination' => [
                    'per_page' => 10,
                    'total_items' => 450,
                ],
            ]);
    }

    public function test_devices_filtering_works_properly(): void
    {
        $response = $this->getJson('/api/v1/devices?category_id=CAT-02&min_ram=16&per_page=5');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $item) {
            $this->assertEquals('CAT-02', $item['category_id']);
            $this->assertGreaterThanOrEqual(16.0, $item['ram_gb']);
        }
    }

    public function test_device_detail_returns_single_device_specs(): void
    {
        $response = $this->getJson('/api/v1/devices/LP001');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => 'LP001',
                    'brand' => ['name' => 'Advan'],
                    'model_name' => 'Workplus',
                ],
            ]);
    }

    public function test_saw_recommendation_engine_generates_valid_rankings(): void
    {
        $payload = [
            'budget_min' => 7000000,
            'budget_max' => 12000000,
            'category_id' => 'CAT-02',
            'preferred_device_type' => 'Laptop',
            'priority_focus' => 'performance',
            'limit' => 3,
        ];

        $response = $this->postJson('/api/v1/recommendations', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => [
                    'algorithm' => 'Simple Additive Weighting (SAW)',
                ],
            ]);

        $recommendations = $response->json('data.top_recommendations');
        $this->assertCount(3, $recommendations);
        $this->assertEquals(1, $recommendations[0]['rank']);
        $this->assertGreaterThan(50.0, $recommendations[0]['match_score']);
        $this->assertNotEmpty($recommendations[0]['reasoning']);
    }

    public function test_saw_recommendation_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/recommendations', [
            'budget_max' => 500, // below 2,000,000 minimum
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'status_code' => 422,
            ]);
    }

    public function test_comparison_endpoint_compares_multiple_devices(): void
    {
        $response = $this->postJson('/api/v1/compare', [
            'device_ids' => ['LP001', 'LP002', 'LP003'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(3, $response->json('data.devices'));
        $this->assertArrayHasKey('spec_comparison', $response->json('data'));
    }
}
