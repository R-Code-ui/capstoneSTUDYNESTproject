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
        Schema::table('users', function (Blueprint $table) {
            // Add StudyNest specific fields
            $table->string('grade_level')->nullable()->comment('Grade 4, Grade 5, Grade 6 - for students only');
            $table->string('lrn')->nullable()->unique()->comment('Learner Reference Number - for students');
            $table->string('teacher_id')->nullable()->unique()->comment('Teacher ID - for teachers');
            $table->string('principal_id')->nullable()->unique()->comment('Principal ID - for principal');
            $table->boolean('is_active')->default(true)->comment('Account status');
            $table->timestamp('last_login_at')->nullable()->comment('Last login timestamp');

            // Make email nullable since we use LRN/Teacher ID/Principal ID for login
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'grade_level',
                'lrn',
                'teacher_id',
                'principal_id',
                'is_active',
                'last_login_at'
            ]);

            // Revert email to not nullable
            $table->string('email')->nullable(false)->change();
        });
    }
};
