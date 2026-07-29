<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->softDeletes('teacher_deleted_at')->nullable()->after('status');
            $table->softDeletes('student_deleted_at')->nullable()->after('teacher_deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropSoftDeletes('teacher_deleted_at');
            $table->dropSoftDeletes('student_deleted_at');
        });
    }
};
