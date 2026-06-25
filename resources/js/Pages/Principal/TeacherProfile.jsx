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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information & Stats ===== */}
                    <Card title="Basic Information">
                        <TeacherProfile teacher={teacher} />
                    </Card>

                    {/* ===== Student Engagement ===== */}
                    <div className="mt-6">
                        <Card title="Student Engagement Overview">
                            <StudentEngagement stats={classroom_stats} />
                        </Card>
                    </div>

                    {/* ===== Lessons ===== */}
                    <div className="mt-6">
                        <Card title="Lesson Monitoring">
                            <LessonMonitoring lessons={lessons} />
                        </Card>
                    </div>

                    {/* ===== Assignments ===== */}
                    <div className="mt-6">
                        <Card title="Assignment Monitoring">
                            <AssignmentMonitoring assignments={assignments} />
                        </Card>
                    </div>

                    {/* ===== Quizzes ===== */}
                    <div className="mt-6">
                        <Card title="Quiz Monitoring">
                            <QuizMonitoring quizzes={quizzes} />
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
