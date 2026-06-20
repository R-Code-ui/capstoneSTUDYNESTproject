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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('grade_level'); // Grade 4, Grade 5, Grade 6
            $table->string('game_title');
            $table->enum('game_type', ['literacy', 'numeracy']);
            $table->json('game_data'); // Configuration for the game
            $table->integer('max_attempts')->default(1);
            $table->date('due_date')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->date('publish_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
