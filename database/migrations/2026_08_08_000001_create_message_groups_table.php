<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index(['teacher_id', 'is_archived']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_groups');
    }
};
