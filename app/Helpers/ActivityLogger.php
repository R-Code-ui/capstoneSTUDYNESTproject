<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogger
{
    /**
     * Log an activity.
     *
     * @param int $userId
     * @param string $userRole (principal, teacher, student)
     * @param string $activityType (login, logout, create, update, delete, publish, archive, submit, attempt, play)
     * @param string $description
     * @param string|null $module
     * @param Request|null $request
     * @return ActivityLog
     */
    public static function log($userId, $userRole, $activityType, $description, $module = null, $request = null)
    {
        return ActivityLog::create([
            'user_id' => $userId,
            'user_role' => $userRole,
            'activity_type' => $activityType,
            'activity_description' => $description,
            'related_module' => $module,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Log a login activity.
     */
    public static function login($userId, $userRole, $request = null)
    {
        return self::log($userId, $userRole, 'login', 'Logged into the system', 'Authentication', $request);
    }

    /**
     * Log a logout activity.
     */
    public static function logout($userId, $userRole, $request = null)
    {
        return self::log($userId, $userRole, 'logout', 'Logged out of the system', 'Authentication', $request);
    }

    /**
     * Log a lesson creation.
     */
    public static function lessonCreated($userId, $lessonTitle, $request = null)
    {
        return self::log(
            $userId,
            'teacher',
            'create',
            "Created lesson: {$lessonTitle}",
            'Lesson Module',
            $request
        );
    }

    /**
     * Log a lesson update.
     */
    public static function lessonUpdated($userId, $lessonTitle, $request = null)
    {
        return self::log(
            $userId,
            'teacher',
            'update',
            "Updated lesson: {$lessonTitle}",
            'Lesson Module',
            $request
        );
    }

    /**
     * Log a lesson publish.
     */
    public static function lessonPublished($userId, $lessonTitle, $request = null)
    {
        return self::log(
            $userId,
            'teacher',
            'publish',
            "Published lesson: {$lessonTitle}",
            'Lesson Module',
            $request
        );
    }

    /**
     * Log an assignment creation.
     */
    public static function assignmentCreated($userId, $assignmentTitle, $request = null)
    {
        return self::log(
            $userId,
            'teacher',
            'create',
            "Created assignment: {$assignmentTitle}",
            'Assignment Module',
            $request
        );
    }

    /**
     * Log an assignment submission.
     */
    public static function assignmentSubmitted($studentId, $assignmentTitle, $request = null)
    {
        return self::log(
            $studentId,
            'student',
            'submit',
            "Submitted assignment: {$assignmentTitle}",
            'Assignment Module',
            $request
        );
    }

    /**
     * Log a quiz attempt.
     */
    public static function quizAttempted($studentId, $quizTitle, $request = null)
    {
        return self::log(
            $studentId,
            'student',
            'attempt',
            "Attempted quiz: {$quizTitle}",
            'Quiz Module',
            $request
        );
    }

    /**
     * Log a game play.
     */
    public static function gamePlayed($studentId, $gameTitle, $request = null)
    {
        return self::log(
            $studentId,
            'student',
            'play',
            "Played game: {$gameTitle}",
            'Game Module',
            $request
        );
    }

    /**
     * Log an announcement creation.
     */
    public static function announcementCreated($userId, $userRole, $title, $request = null)
    {
        return self::log(
            $userId,
            $userRole,
            'create',
            "Created announcement: {$title}",
            'Announcement Module',
            $request
        );
    }
}
