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
        Schema::create('criteria_weights', function (Blueprint $table) {
            $table->id();
            $table->string('category_id')->index();
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            
            $table->string('criterion_code'); // PRICE, CPU, RAM, GPU, DISPLAY, WEIGHT
            $table->string('criterion_name');
            $table->enum('criterion_type', ['cost', 'benefit']);
            $table->decimal('weight', 4, 3); // 0.250, 0.300, etc. (total per category = 1.000)
            
            $table->timestamps();
            
            $table->unique(['category_id', 'criterion_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('criteria_weights');
    }
};
