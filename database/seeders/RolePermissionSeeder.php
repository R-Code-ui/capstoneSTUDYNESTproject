<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ========== CREATE PERMISSIONS ==========

        // Lesson Permissions
        Permission::firstOrCreate(['name' => 'lesson.view']);
        Permission::firstOrCreate(['name' => 'lesson.create']);
        Permission::firstOrCreate(['name' => 'lesson.edit']);
        Permission::firstOrCreate(['name' => 'lesson.delete']);

        // Assignment Permissions
        Permission::firstOrCreate(['name' => 'assignment.view']);
        Permission::firstOrCreate(['name' => 'assignment.create']);
        Permission::firstOrCreate(['name' => 'assignment.edit']);
        Permission::firstOrCreate(['name' => 'assignment.delete']);

        // Quiz Permissions
        Permission::firstOrCreate(['name' => 'quiz.view']);
        Permission::firstOrCreate(['name' => 'quiz.create']);
        Permission::firstOrCreate(['name' => 'quiz.edit']);
        Permission::firstOrCreate(['name' => 'quiz.delete']);

        // Announcement Permissions
        Permission::firstOrCreate(['name' => 'announcement.view']);
        Permission::firstOrCreate(['name' => 'announcement.create']);
        Permission::firstOrCreate(['name' => 'announcement.edit']);
        Permission::firstOrCreate(['name' => 'announcement.delete']);

        // Game Permissions
        Permission::firstOrCreate(['name' => 'game.view']);
        Permission::firstOrCreate(['name' => 'game.create']);
        Permission::firstOrCreate(['name' => 'game.edit']);
        Permission::firstOrCreate(['name' => 'game.delete']);

        // Report Permissions
        Permission::firstOrCreate(['name' => 'report.view']);

        // User Management Permissions
        Permission::firstOrCreate(['name' => 'user.manage']);
        Permission::firstOrCreate(['name' => 'teacher.manage']);
        Permission::firstOrCreate(['name' => 'student.manage']);

        // ========== CREATE ROLES & ASSIGN PERMISSIONS ==========

        // Principal Role - Has All Permissions
        $principal = Role::firstOrCreate(['name' => 'principal']);
        $principal->syncPermissions(Permission::all());

        // Teacher Role - Limited Permissions
        $teacher = Role::firstOrCreate(['name' => 'teacher']);
        $teacher->syncPermissions([
            'lesson.view', 'lesson.create', 'lesson.edit', 'lesson.delete',
            'assignment.view', 'assignment.create', 'assignment.edit', 'assignment.delete',
            'quiz.view', 'quiz.create', 'quiz.edit', 'quiz.delete',
            'announcement.view', 'announcement.create', 'announcement.edit', 'announcement.delete',
            'game.view', 'game.create', 'game.edit', 'game.delete',
            'report.view',
        ]);

        // Student Role - View-Only Permissions
        $student = Role::firstOrCreate(['name' => 'student']);
        $student->syncPermissions([
            'lesson.view',
            'assignment.view',
            'quiz.view',
            'announcement.view',
            'game.view',
            'report.view',
        ]);

        $this->command->info('✅ Roles and permissions seeded successfully!');
    }
}
