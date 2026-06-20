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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('grade_level'); // Grade 4, Grade 5, Grade 6
            $table->string('subject');
            $table->string('school_year');
            $table->string('trimester');
            $table->string('week_number');
            $table->foreignId('related_lesson_id')->nullable()->constrained('lessons')->onDelete('set null');

            $table->string('quiz_title');
            $table->enum('quiz_type', ['multiple_choice', 'identification', 'true_false']);
            $table->integer('total_questions');
            $table->integer('time_limit')->nullable(); // in minutes
            $table->integer('passing_score')->nullable(); // percentage
            $table->integer('attempts_allowed')->default(1);
            $table->boolean('shuffle_questions')->default(false);

            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->string('visibility')->default('assigned_class_only');
            $table->date('publish_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
