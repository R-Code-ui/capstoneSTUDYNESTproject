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
        Schema::table('lessons', function (Blueprint $table) {
            // Add foreign key constraints for related activities
            $table->foreign('related_assignment_id')
                  ->references('id')
                  ->on('assignments')
                  ->onDelete('set null');

            $table->foreign('related_quiz_id')
                  ->references('id')
                  ->on('quizzes')
                  ->onDelete('set null');

            $table->foreign('related_game_id')
                  ->references('id')
                  ->on('games')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['related_assignment_id']);
            $table->dropForeign(['related_quiz_id']);
            $table->dropForeign(['related_game_id']);
        });
    }
};
