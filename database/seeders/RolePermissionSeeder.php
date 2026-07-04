<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ========== CREATE PERMISSIONS ==========
        Permission::firstOrCreate(['name' => 'lesson.view']);
        Permission::firstOrCreate(['name' => 'lesson.create']);
        Permission::firstOrCreate(['name' => 'lesson.edit']);
        Permission::firstOrCreate(['name' => 'lesson.delete']);

        Permission::firstOrCreate(['name' => 'assignment.view']);
        Permission::firstOrCreate(['name' => 'assignment.create']);
        Permission::firstOrCreate(['name' => 'assignment.edit']);
        Permission::firstOrCreate(['name' => 'assignment.delete']);

        Permission::firstOrCreate(['name' => 'quiz.view']);
        Permission::firstOrCreate(['name' => 'quiz.create']);
        Permission::firstOrCreate(['name' => 'quiz.edit']);
        Permission::firstOrCreate(['name' => 'quiz.delete']);

        Permission::firstOrCreate(['name' => 'announcement.view']);
        Permission::firstOrCreate(['name' => 'announcement.create']);
        Permission::firstOrCreate(['name' => 'announcement.edit']);
        Permission::firstOrCreate(['name' => 'announcement.delete']);

        Permission::firstOrCreate(['name' => 'game.view']);
        Permission::firstOrCreate(['name' => 'game.create']);
        Permission::firstOrCreate(['name' => 'game.edit']);
        Permission::firstOrCreate(['name' => 'game.delete']);

        Permission::firstOrCreate(['name' => 'report.view']);

        Permission::firstOrCreate(['name' => 'user.manage']);
        Permission::firstOrCreate(['name' => 'teacher.manage']);
        Permission::firstOrCreate(['name' => 'student.manage']);

        Permission::firstOrCreate(['name' => 'log.view']);

        Permission::firstOrCreate(['name' => 'message.view']);
        Permission::firstOrCreate(['name' => 'message.send']);
        Permission::firstOrCreate(['name' => 'message.delete']);

        Permission::firstOrCreate(['name' => 'progress.view']);   // ✅ new

        // ========== CREATE ROLES & ASSIGN PERMISSIONS ==========
        $principalRole = Role::firstOrCreate(['name' => 'principal']);
        $principalRole->givePermissionTo([
            'lesson.view', 'lesson.create', 'lesson.edit', 'lesson.delete',
            'assignment.view', 'assignment.create', 'assignment.edit', 'assignment.delete',
            'quiz.view', 'quiz.create', 'quiz.edit', 'quiz.delete',
            'announcement.view', 'announcement.create', 'announcement.edit', 'announcement.delete',
            'game.view', 'game.create', 'game.edit', 'game.delete',
            'report.view',
            'user.manage', 'teacher.manage', 'student.manage',
            'log.view',
            'message.view', 'message.send', 'message.delete',
            'progress.view',
        ]);

        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);
        $teacherRole->givePermissionTo([
            'lesson.view', 'lesson.create', 'lesson.edit', 'lesson.delete',
            'assignment.view', 'assignment.create', 'assignment.edit', 'assignment.delete',
            'quiz.view', 'quiz.create', 'quiz.edit', 'quiz.delete',
            'announcement.view', 'announcement.create', 'announcement.edit', 'announcement.delete',
            'game.view', 'game.create', 'game.edit', 'game.delete',
            'report.view',
            'message.view', 'message.send', 'message.delete',
            'progress.view',
        ]);

        $studentRole = Role::firstOrCreate(['name' => 'student']);
        $studentRole->givePermissionTo([
            'lesson.view',
            'assignment.view',
            'quiz.view',
            'game.view',
            'announcement.view',
            'message.view', 'message.send',
        ]);

        $this->command->info('✅ Roles and permissions seeded successfully!');
    }
}
