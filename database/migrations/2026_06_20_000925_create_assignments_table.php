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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('grade_level'); // Grade 4, Grade 5, Grade 6
            $table->string('subject');
            $table->string('school_year');
            $table->string('trimester');
            $table->string('week_number');
            $table->foreignId('related_lesson_id')->nullable()->constrained('lessons')->onDelete('set null');

            $table->string('assignment_title');
            $table->enum('assignment_type', [
                'homework',
                'worksheet',
                'performance_task',
                'project',
                'reflection_activity',
                'practice_exercise',
                'reading_assignment'
            ]);
            $table->longText('instructions'); // Rich text
            $table->integer('total_points');
            $table->integer('estimated_time')->nullable(); // in minutes
            $table->boolean('allow_late_submission')->default(false);
            $table->date('due_date');
            $table->time('due_time');

            // JSON for submission methods: digital, photo, paper
            $table->json('submission_methods');

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
        Schema::dropIfExists('assignments');
    }
};
