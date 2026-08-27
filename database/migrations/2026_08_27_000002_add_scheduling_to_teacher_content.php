<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['lessons', 'assignments', 'quizzes', 'games'];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->enum('status', ['draft', 'scheduled', 'published', 'archived'])->default('draft')->change();
                $table->dateTime('publish_date')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            DB::table($tableName)->where('status', 'scheduled')->update([
                'status' => 'draft',
                'publish_date' => $tableName === 'lessons' ? null : now()->toDateString(),
            ]);
            if ($tableName !== 'lessons') {
                DB::table($tableName)->whereNull('publish_date')->update([
                    'publish_date' => now()->toDateString(),
                ]);
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->change();
                $table->date('publish_date')->nullable($tableName === 'lessons')->change();
            });
        }
    }
};
