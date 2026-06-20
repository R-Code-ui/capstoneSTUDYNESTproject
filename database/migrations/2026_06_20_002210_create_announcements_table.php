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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('user_role', ['principal', 'teacher']);
            $table->string('title');
            $table->string('category'); // Reminder, Quiz Schedule, Assignment Notice, etc.
            $table->longText('content'); // Rich text
            $table->string('target_audience'); // all_users, all_grades, grade_4, grade_5, grade_6, teachers_only
            $table->enum('priority', ['normal', 'important', 'urgent'])->default('normal');
            $table->boolean('is_pinned')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->date('publish_date');
            $table->date('expiration_date')->nullable();
            $table->integer('view_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
