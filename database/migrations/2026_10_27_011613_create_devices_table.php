<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->string('id')->primary(); // LP001, LP002, etc.
            $table->string('category_id')->nullable()->index();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->string('category_name')->index();
            $table->string('target_major')->nullable();
            
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->string('brand_name')->index();
            $table->string('model_name');
            $table->string('device_type')->index(); // Laptop, PC Rakitan, 2-in-1, etc.
            
            // Specifications
            $table->string('processor');
            $table->string('gpu');
            $table->boolean('is_dedicated_gpu')->default(false);
            $table->decimal('ram_gb', 5, 1);
            $table->boolean('is_upgradeable_ram')->default(false);
            $table->string('storage');
            $table->integer('storage_gb')->default(256);
            $table->string('display')->nullable();
            $table->string('color_gamut')->nullable();
            $table->decimal('weight_kg', 4, 2)->default(1.50);
            
            // Financial & Market
            $table->unsignedBigInteger('price_idr')->index();
            $table->string('purchase_platform')->nullable();
            $table->string('warranty')->nullable();
            $table->string('usecase_tags')->nullable();
            
            // Qualitative Analysis
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
