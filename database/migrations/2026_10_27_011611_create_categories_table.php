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
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary(); // CAT-01 s/d CAT-07
            $table->string('name'); // Dasar/Pelajar, Multitasking & Coding, etc.
            $table->string('slug')->unique();
            $table->text('computing_profile');
            $table->string('min_cpu');
            $table->string('min_ram');
            $table->string('min_gpu');
            $table->string('min_display');
            $table->string('budget_range');
            $table->unsignedBigInteger('min_budget')->default(0);
            $table->unsignedBigInteger('max_budget')->default(0);
            $table->text('target_persona');
            $table->text('key_features')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
