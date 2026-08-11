<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE lesson_resources MODIFY resource_type ENUM('pdf_module', 'worksheet', 'image', 'url', 'video') NOT NULL");
        DB::statement("ALTER TABLE assignment_resources MODIFY resource_type ENUM('pdf_module', 'worksheet', 'image', 'url', 'video') NOT NULL");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE lesson_resources MODIFY resource_type ENUM('pdf_module', 'worksheet', 'image', 'url') NOT NULL");
        DB::statement("ALTER TABLE assignment_resources MODIFY resource_type ENUM('pdf_module', 'worksheet', 'image', 'url') NOT NULL");
    }
};
