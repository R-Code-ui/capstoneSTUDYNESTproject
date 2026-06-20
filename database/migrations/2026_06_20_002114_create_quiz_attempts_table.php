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
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->integer('attempt_number');
            $table->integer('score');
            $table->integer('total_questions');
            $table->json('answers'); // Stores student answers
            $table->timestamp('completed_at')->nullable();
            $table->enum('status', ['started', 'completed', 'failed'])->default('started');
            $table->timestamps();

            // Ensure one attempt per student per quiz
            // $table->unique(['quiz_id', 'student_id', 'attempt_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};
