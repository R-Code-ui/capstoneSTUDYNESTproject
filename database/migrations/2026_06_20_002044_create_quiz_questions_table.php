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
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->integer('question_number');
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'identification', 'true_false']);

            // Multiple choice fields
            $table->string('choice_a')->nullable();
            $table->string('choice_b')->nullable();
            $table->string('choice_c')->nullable();
            $table->string('choice_d')->nullable();

            // Correct answer (letter for multiple choice, text for identification, boolean for true/false)
            $table->string('correct_answer');

            // Alternative answers for identification (stored as JSON)
            $table->json('alternative_answers')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
