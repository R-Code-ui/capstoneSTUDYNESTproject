import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import TeacherProfile from '@/Components/TeacherProfile';
import LessonMonitoring from '@/Components/LessonMonitoring';
import AssignmentMonitoring from '@/Components/AssignmentMonitoring';
import QuizMonitoring from '@/Components/QuizMonitoring';
import StudentEngagement from '@/Components/StudentEngagement';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function TeacherProfilePage({ teacher, lessons, assignments, quizzes, classroom_stats }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold text-gray-800">
                        Teacher Profile: {teacher.name}
                    </h2>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={() => router.visit(route('principal.teachers.index'))}>
                            Back to List
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Teacher Profile: ${teacher.name}`} />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* ===== Basic Information & Stats ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
                        </div>
                        <div className="p-6">
                            <TeacherProfile teacher={teacher} />
                        </div>
                    </div>

                    {/* ===== Student Engagement ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Student Engagement Overview</h3>
                        </div>
                        <div className="p-6">
                            <StudentEngagement stats={classroom_stats} />
                        </div>
                    </div>

                    {/* ===== Lessons ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Lesson Monitoring</h3>
                        </div>
                        <div className="p-6">
                            <LessonMonitoring lessons={lessons} />
                        </div>
                    </div>

                    {/* ===== Assignments ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Assignment Monitoring</h3>
                        </div>
                        <div className="p-6">
                            <AssignmentMonitoring assignments={assignments} />
                        </div>
                    </div>

                    {/* ===== Quizzes ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Quiz Monitoring</h3>
                        </div>
                        <div className="p-6">
                            <QuizMonitoring quizzes={quizzes} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
