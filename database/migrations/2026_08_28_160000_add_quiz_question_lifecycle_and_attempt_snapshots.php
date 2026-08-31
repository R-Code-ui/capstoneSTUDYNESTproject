<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('quiz_questions', 'is_active')) {
            Schema::table('quiz_questions', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('alternative_answers')->index();
            });
        }

        if (!Schema::hasColumn('quiz_attempts', 'question_snapshot')) {
            Schema::table('quiz_attempts', function (Blueprint $table) {
                $table->json('question_snapshot')->nullable()->after('answers');
            });
        }

        DB::table('quiz_attempts')->orderBy('id')->chunkById(100, function ($attempts) {
            foreach ($attempts as $attempt) {
                $questions = DB::table('quiz_questions')
                    ->where('quiz_id', $attempt->quiz_id)
                    ->orderBy('question_number')
                    ->get();
                $answers = json_decode($attempt->answers ?: '[]', true);
                if (is_string($answers)) {
                    $answers = json_decode($answers, true);
                }
                $answers = is_array($answers) ? $answers : [];
                $answeredIds = array_map('intval', array_keys($answers));
                $targetCount = max((int) $attempt->total_questions, count($answeredIds));
                $selected = $questions->whereIn('id', $answeredIds);

                foreach ($questions as $question) {
                    if ($selected->count() >= $targetCount) break;
                    if (!in_array((int) $question->id, $answeredIds, true)) {
                        $selected->push($question);
                    }
                }

                $snapshot = $selected
                    ->sortBy('question_number')
                    ->take($targetCount)
                    ->values()
                    ->map(fn ($question) => [
                        'id' => (int) $question->id,
                        'question_number' => (int) $question->question_number,
                        'question_text' => $question->question_text,
                        'question_type' => $question->question_type,
                        'choice_a' => $question->choice_a,
                        'choice_b' => $question->choice_b,
                        'choice_c' => $question->choice_c,
                        'choice_d' => $question->choice_d,
                        'correct_answer' => $question->correct_answer,
                        'alternative_answers' => json_decode($question->alternative_answers ?: '[]', true) ?: [],
                    ])->all();

                DB::table('quiz_attempts')
                    ->where('id', $attempt->id)
                    ->update(['question_snapshot' => json_encode($snapshot)]);
            }
        });

        // Repair legacy rows left behind by the old "preserve all after an attempt" behavior.
        // Snapshots are created first so historical attempts retain these question records.
        DB::table('quizzes')->orderBy('id')->chunkById(100, function ($quizzes) {
            foreach ($quizzes as $quiz) {
                $activeIds = DB::table('quiz_questions')
                    ->where('quiz_id', $quiz->id)
                    ->orderBy('question_number')
                    ->orderBy('id')
                    ->limit((int) $quiz->total_questions)
                    ->pluck('id');

                DB::table('quiz_questions')
                    ->where('quiz_id', $quiz->id)
                    ->when($activeIds->isNotEmpty(), fn ($query) => $query->whereNotIn('id', $activeIds))
                    ->update(['is_active' => false]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn('question_snapshot');
        });

        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropColumn('is_active');
        });
    }
};
