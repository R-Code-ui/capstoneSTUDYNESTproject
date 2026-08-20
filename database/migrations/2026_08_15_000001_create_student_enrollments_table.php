<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('school_year');
            $table->string('grade_level');
            $table->enum('status', ['active', 'inactive', 'completed'])->default('active');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();
            $table->unique(['student_id', 'school_year']);
            $table->index(['school_year', 'grade_level', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};
