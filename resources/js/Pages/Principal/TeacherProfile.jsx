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
import { toast } from 'sonner';

// Helper: Ensure numeric values show 0 if null/undefined
const safeNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    return value;
};

// Helper: Format date to readable string
const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function TeacherProfilePage({
    teacher,
    lessons,
    lessons_pagination,
    assignments,
    assignments_pagination,
    quizzes,
    quizzes_pagination,
    classroom_stats,
}) {
    const handleBackToList = () => {
        router.visit(route('principal.teachers.index'), {
            onError: () => toast.error('Unable to return to teacher monitoring. Please try again.'),
        });
    };

    // Format data with safeNumber for numeric values
    const formattedTeacher = {
        ...teacher,
        total_lessons: safeNumber(teacher.total_lessons),
        total_assignments: safeNumber(teacher.total_assignments),
        total_quizzes: safeNumber(teacher.total_quizzes),
    };

    const formattedClassroomStats = {
        ...classroom_stats,
        total_students: safeNumber(classroom_stats.total_students),
        lesson_completion_rate: safeNumber(classroom_stats.lesson_completion_rate),
        assignment_completion_rate: safeNumber(classroom_stats.assignment_completion_rate),
        quiz_participation_rate: safeNumber(classroom_stats.quiz_participation_rate),
    };

    // Format assignments with safeNumber and formatted dates
    const formattedAssignments = assignments.map((assignment) => ({
        ...assignment,
        due_date: formatDate(assignment.due_date),
        submissions: safeNumber(assignment.submissions),
    }));

    // Format quizzes with safeNumber
    const formattedQuizzes = quizzes.map((quiz) => ({
        ...quiz,
        attempts: safeNumber(quiz.attempts),
    }));

    // Format lessons with formatted dates
    const formattedLessons = lessons.map((lesson) => ({
        ...lesson,
        created_at: formatDate(lesson.created_at),
    }));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={handleBackToList}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                        aria-label="Back to Teacher Monitoring"
                        title="Back to Teacher Monitoring"
                    >
                        ← Back
                    </button>
                    <h2 className="principal-profile-heading min-w-0 flex-1 text-xl font-bold text-gray-800" title={`Teacher Profile: ${teacher.name}`}>
                        Teacher Profile: {teacher.name}
                    </h2>
                </div>
            }
        >
            <Head title={`Teacher Profile: ${teacher.name}`} />

            <style>{`
                .principal-profile-heading { max-width: 420px; }
                @media (max-width: 639px) { .principal-profile-heading { max-width: 100%; } }
            `}</style>

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ===== Basic Information & Stats ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <TeacherProfile teacher={formattedTeacher} />
                        </div>
                    </div>

                    {/* ===== Student Engagement ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Student Engagement Overview</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <StudentEngagement stats={formattedClassroomStats} />
                        </div>
                    </div>

                    {/* ===== Lessons ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Lesson Monitoring</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <LessonMonitoring lessons={formattedLessons} pagination={lessons_pagination} />
                        </div>
                    </div>

                    {/* ===== Assignments ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Assignment Monitoring</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <AssignmentMonitoring assignments={formattedAssignments} pagination={assignments_pagination} />
                        </div>
                    </div>

                    {/* ===== Quizzes ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Quiz Monitoring</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <QuizMonitoring quizzes={formattedQuizzes} pagination={quizzes_pagination} />
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
