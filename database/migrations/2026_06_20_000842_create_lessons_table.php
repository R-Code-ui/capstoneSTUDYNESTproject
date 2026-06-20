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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('grade_level'); // Grade 4, Grade 5, Grade 6
            $table->string('subject'); // English, Filipino, Mathematics, etc.
            $table->string('school_year'); // SY 2026-2027
            $table->string('trimester'); // 1st, 2nd, 3rd
            $table->string('week_number'); // Week 1-12
            $table->text('learning_competency');
            $table->text('learning_objective');
            $table->string('bow_code')->nullable();
            $table->string('lesson_title');
            $table->text('lesson_description');
            $table->longText('lesson_content'); // Rich text
            $table->text('key_takeaways')->nullable();

            // Related activities (nullable foreign keys to tables that will be created later)
            $table->unsignedBigInteger('related_assignment_id')->nullable();
            $table->unsignedBigInteger('related_quiz_id')->nullable();
            $table->unsignedBigInteger('related_game_id')->nullable();

            // Status enum
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->date('publish_date');
            $table->timestamps();

            // Foreign key constraints for related tables (will be added after those tables exist)
            // We'll add these in a separate migration or after creating assignments, quizzes, games
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
