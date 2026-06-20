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
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->enum('submission_method', ['digital', 'photo', 'paper']);

            // File upload fields (nullable for paper submissions)
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();

            $table->timestamp('submitted_at')->nullable();

            $table->enum('status', [
                'not_submitted',
                'submitted',
                'late_submission',
                'reviewed',
                'graded',
                'returned_for_revision'
            ])->default('not_submitted');

            $table->integer('score')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamp('graded_at')->nullable();

            $table->timestamps();

            // Ensure one submission per student per assignment
            $table->unique(['assignment_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};
