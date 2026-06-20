<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentResource extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'assignment_id',
        'resource_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
    ];

    /**
     * Get the assignment that owns this resource.
     */
    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}
