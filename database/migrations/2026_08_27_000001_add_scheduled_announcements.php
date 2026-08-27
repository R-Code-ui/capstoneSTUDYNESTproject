<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->enum('status', ['draft', 'scheduled', 'published', 'archived'])->default('draft')->change();
            $table->dateTime('publish_date')->nullable()->change();
            $table->dateTime('expiration_date')->nullable()->change();
        });

        // Date-only expiration values previously remained valid for the whole day.
        DB::table('announcements')
            ->whereNotNull('expiration_date')
            ->orderBy('id')
            ->chunkById(100, function ($announcements) {
                foreach ($announcements as $announcement) {
                    DB::table('announcements')
                        ->where('id', $announcement->id)
                        ->update([
                            'expiration_date' => Carbon::parse($announcement->expiration_date)->endOfDay(),
                        ]);
                }
            });
    }

    public function down(): void
    {
        DB::table('announcements')->where('status', 'scheduled')->update([
            'status' => 'draft',
            'publish_date' => now()->toDateString(),
        ]);

        DB::table('announcements')->whereNull('publish_date')->update([
            'publish_date' => now()->toDateString(),
        ]);

        DB::table('announcements')
            ->whereNotNull('publish_date')
            ->orderBy('id')
            ->chunkById(100, function ($announcements) {
                foreach ($announcements as $announcement) {
                    DB::table('announcements')
                        ->where('id', $announcement->id)
                        ->update([
                            'publish_date' => Carbon::parse($announcement->publish_date)->toDateString(),
                            'expiration_date' => $announcement->expiration_date
                                ? Carbon::parse($announcement->expiration_date)->toDateString()
                                : null,
                        ]);
                }
            });

        Schema::table('announcements', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->change();
            $table->date('publish_date')->nullable(false)->change();
            $table->date('expiration_date')->nullable()->change();
        });
    }
};
