<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ========== CREATE PRINCIPAL ==========
        $principal = User::firstOrCreate(
            ['principal_id' => 'PRN-001'],
            [
                'name' => 'Principal User',
                'email' => 'principal@studynest.com',
                'password' => Hash::make('Principal123'),
                'is_active' => true,
                'grade_level' => null,
            ]
        );
        $principal->assignRole('principal');

        // ========== CREATE TEACHERS ==========

        // Teacher 1 - Grade 4
        $teacher1 = User::firstOrCreate(
            ['teacher_id' => 'TCH-001'],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@studynest.com',
                'password' => Hash::make('Teacher123'),
                'is_active' => true,
                'grade_level' => null,
            ]
        );
        $teacher1->assignRole('teacher');

        // Teacher 2 - Grade 5 & 6
        $teacher2 = User::firstOrCreate(
            ['teacher_id' => 'TCH-002'],
            [
                'name' => 'Juan Reyes',
                'email' => 'juan.reyes@studynest.com',
                'password' => Hash::make('Teacher123'),
                'is_active' => true,
                'grade_level' => null,
            ]
        );
        $teacher2->assignRole('teacher');

        // ========== CREATE STUDENTS ==========

        // Student 1 - Grade 4
        $student1 = User::firstOrCreate(
            ['lrn' => '118784260018'],
            [
                'name' => 'Angelo Santos',
                'email' => 'angelo.santos@studynest.com',
                'password' => Hash::make('Student123'),
                'is_active' => true,
                'grade_level' => 'Grade 4',
            ]
        );
        $student1->assignRole('student');

        // Student 2 - Grade 5
        $student2 = User::firstOrCreate(
            ['lrn' => '118784260019'],
            [
                'name' => 'Maria Dela Cruz',
                'email' => 'maria.delacruz@studynest.com',
                'password' => Hash::make('Student123'),
                'is_active' => true,
                'grade_level' => 'Grade 5',
            ]
        );
        $student2->assignRole('student');

        // Student 3 - Grade 6
        $student3 = User::firstOrCreate(
            ['lrn' => '118784260020'],
            [
                'name' => 'Pedro Reyes',
                'email' => 'pedro.reyes@studynest.com',
                'password' => Hash::make('Student123'),
                'is_active' => true,
                'grade_level' => 'Grade 6',
            ]
        );
        $student3->assignRole('student');

        // ========== ASSIGN TEACHER GRADE LEVELS ==========

        // Teacher 1 → Grade 4
        \App\Models\TeacherGradeAssignment::firstOrCreate([
            'teacher_id' => $teacher1->id,
            'grade_level' => 'Grade 4',
        ]);

        // Teacher 2 → Grade 5 & Grade 6
        \App\Models\TeacherGradeAssignment::firstOrCreate([
            'teacher_id' => $teacher2->id,
            'grade_level' => 'Grade 5',
        ]);
        \App\Models\TeacherGradeAssignment::firstOrCreate([
            'teacher_id' => $teacher2->id,
            'grade_level' => 'Grade 6',
        ]);

        $this->command->info('✅ Users seeded successfully!');
        $this->command->info('📋 Principal: PRN-001 / Principal123');
        $this->command->info('📋 Teachers: TCH-001, TCH-002 / Teacher123');
        $this->command->info('📋 Students: 118784260018, 118784260019, 118784260020 / Student123');
    }
}
