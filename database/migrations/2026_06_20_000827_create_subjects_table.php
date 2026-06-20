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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // English, Filipino, Mathematics, Science, etc.
            $table->string('grade_level'); // Grade 4, Grade 5, Grade 6
            $table->text('description')->nullable();
            $table->timestamps();

            // A subject name can be unique per grade level
            $table->unique(['name', 'grade_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
