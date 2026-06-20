<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportExport extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'report_type',
        'grade_level',
        'subject',
        'trimester',
        'generated_at',
        'file_path',
        'file_name',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime',
        ];
    }

    /**
     * Get the user who generated this report.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
