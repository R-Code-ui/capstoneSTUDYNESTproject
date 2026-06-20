<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'grade_level',
        'lrn',
        'teacher_id',
        'principal_id',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Find a user by LRN, Teacher ID, or Principal ID
     * This is used for authentication
     */
    public static function findForLogin($username)
    {
        return static::where('lrn', $username)
            ->orWhere('teacher_id', $username)
            ->orWhere('principal_id', $username)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Check if the user is a student
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    /**
     * Check if the user is a teacher
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('teacher');
    }

    /**
     * Check if the user is a principal
     */
    public function isPrincipal(): bool
    {
        return $this->hasRole('principal');
    }

    /**
     * Get the user's role label
     */
    public function getRoleLabelAttribute(): string
    {
        if ($this->isPrincipal()) {
            return 'Principal';
        } elseif ($this->isTeacher()) {
            return 'Teacher';
        } elseif ($this->isStudent()) {
            return 'Student';
        }
        return 'Unknown';
    }

    /**
     * Get the user's display name for login (LRN, Teacher ID, or Principal ID)
     */
    public function getLoginIdAttribute(): string
    {
        return $this->lrn ?? $this->teacher_id ?? $this->principal_id ?? $this->email;
    }

    // ========== Relationships ==========

    /**
     * Teacher's grade assignments
     */
    public function gradeAssignments()
    {
        return $this->hasMany(TeacherGradeAssignment::class, 'teacher_id');
    }

    /**
     * Lessons created by teacher
     */
    public function lessons()
    {
        return $this->hasMany(Lesson::class, 'teacher_id');
    }

    /**
     * Assignments created by teacher
     */
    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'teacher_id');
    }

    /**
     * Quizzes created by teacher
     */
    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'teacher_id');
    }

    /**
     * Games created by teacher
     */
    public function games()
    {
        return $this->hasMany(Game::class, 'teacher_id');
    }

    /**
     * Messages sent by user
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Messages received by user
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Assignment submissions by student
     */
    public function assignmentSubmissions()
    {
        return $this->hasMany(AssignmentSubmission::class, 'student_id');
    }

    /**
     * Quiz attempts by student
     */
    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class, 'student_id');
    }

    /**
     * Game results by student
     */
    public function gameResults()
    {
        return $this->hasMany(GameResult::class, 'student_id');
    }

    /**
     * Announcement views by student
     */
    public function announcementViews()
    {
        return $this->hasMany(AnnouncementView::class, 'student_id');
    }

    /**
     * Announcements created by user
     */
    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'user_id');
    }

    /**
     * Activity logs for user
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    /**
     * Report exports by user
     */
    public function reportExports()
    {
        return $this->hasMany(ReportExport::class, 'user_id');
    }
}
