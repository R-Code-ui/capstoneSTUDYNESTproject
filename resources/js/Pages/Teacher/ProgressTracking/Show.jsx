import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import { toast } from 'sonner';

// Heroicons
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PuzzlePieceIcon,
    ChartBarIcon,
    ArrowLeftIcon,
    UserIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function ProgressShow({ student, progress }) {
    const getStatusBadge = (percentage) => {
        if (percentage >= 80) return 'excellent';
        if (percentage >= 60) return 'needs_monitoring';
        return 'needs_support';
    };

    const getStatusLabel = (percentage) => {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Needs Monitoring';
        return 'Needs Support';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
                    <button type="button" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950" onClick={() => router.visit(route('teacher.progress.index'), {
                        onError: () => toast.error('Unable to return to progress tracking. Please try again.'),
                    })} aria-label="Back to Progress List" title="Back to Progress List">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </button>
                    <span className="progress-show-title min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-800" title={`Student Progress: ${student.name}`}>
                        Student Progress: {student.name}
                    </span>
                </div>
            }
        >
            <Head title={`Progress: ${student.name}`} />

            <style>{`
                .progress-show-title {
                    min-width: 0;
                    max-width: min(100%, 48rem);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .studynest-layout.theme-dark .progress-page .bg-white {
                    background-color: rgb(15 23 42) !important;
                }
                .studynest-layout.theme-dark .progress-page .bg-gray-50 {
                    background-color: rgb(30 41 59) !important;
                }
                .studynest-layout.theme-dark .progress-page .bg-gray-200 {
                    background-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .progress-page .border-gray-100,
                .studynest-layout.theme-dark .progress-page .border-gray-200 {
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-gray-800 {
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-gray-700,
                .studynest-layout.theme-dark .progress-page .text-gray-600 {
                    color: rgb(203 213 225) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-gray-500,
                .studynest-layout.theme-dark .progress-page .text-gray-400 {
                    color: rgb(148 163 184) !important;
                }
            `}</style>

            <div className="progress-page py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Student Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Student Name</div>
                                    <div className="font-medium text-gray-800 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                        {student.name}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Student ID</div>
                                    <div className="font-medium text-gray-800">{student.lrn}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{student.grade_level}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overall Progress</div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">
                                            {progress.overall_progress}%
                                        </span>
                                        <StatusBadge status={getStatusBadge(progress.overall_progress)} />
                                    </div>
                                </div>
                            </div>

                            {/* Overall Progress Bar */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {progress.overall_progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full transition-all duration-500 ${
                                            progress.overall_progress >= 80 ? 'bg-emerald-500' :
                                            progress.overall_progress >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${progress.overall_progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-gray-500">
                                    <span>Needs Support (0-59%)</span>
                                    <span>Needs Monitoring (60-79%)</span>
                                    <span>Excellent (80-100%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Progress Breakdown ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Lessons */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5 text-blue-500" />
                                    Lessons
                                </h3>
                            </div>
                            <div className="space-y-2 p-4 sm:p-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="font-medium text-gray-800">
                                        {progress.lessons.completed} / {progress.lessons.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.lessons.percentage}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    {progress.lessons.percentage}%
                                </div>
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-500" />
                                    Assignments
                                </h3>
                            </div>
                            <div className="space-y-2 p-4 sm:p-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Submitted</span>
                                    <span className="font-medium text-gray-800">
                                        {progress.assignments.submitted} / {progress.assignments.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-emerald-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.assignments.percentage}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    {progress.assignments.percentage}%
                                </div>
                            </div>
                        </div>

                        {/* Quizzes */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-purple-500" />
                                    Quizzes
                                </h3>
                            </div>
                            <div className="space-y-2 p-4 sm:p-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="font-medium text-gray-800">
                                        {progress.quizzes.attempts} / {progress.quizzes.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-purple-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.quizzes.total > 0 ? (progress.quizzes.attempts / progress.quizzes.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Avg Score</span>
                                    <span className="font-medium text-gray-800">
                                        {progress.quizzes.average_score}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Games */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <PuzzlePieceIcon className="w-5 h-5 text-amber-500" />
                                    Games
                                </h3>
                            </div>
                            <div className="space-y-2 p-4 sm:p-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="font-medium text-gray-800">
                                        {progress.games.completed} / {progress.games.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-amber-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.games.total > 0 ? (progress.games.completed / progress.games.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Quiz Performance Detail ===== */}
                    {progress.quizzes.performance && progress.quizzes.performance.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <ChartBarIcon className="w-5 h-5 text-purple-500" />
                                        Quiz Performance Details
                                    </h3>
                                </div>
                                <div className="space-y-3 p-4 sm:p-6">
                                    {progress.quizzes.performance.map((quiz, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 gap-2"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-800">
                                                    {quiz.quiz_title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {quiz.completed_at || 'Not yet completed'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${
                                                    quiz.percentage >= 80 ? 'text-emerald-600' :
                                                    quiz.percentage >= 60 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {quiz.score}/{quiz.total}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {quiz.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== Game Performance Detail ===== */}
                    {progress.games.performance && progress.games.performance.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <PuzzlePieceIcon className="w-5 h-5 text-amber-500" />
                                        Game Performance Details
                                    </h3>
                                </div>
                                <div className="space-y-3 p-4 sm:p-6">
                                    {progress.games.performance.map((game, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 gap-2"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-800">
                                                    {game.game_title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {game.game_type?.charAt(0).toUpperCase() + game.game_type?.slice(1)}
                                                    {game.completed_at && ` • ${game.completed_at}`}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${
                                                    game.score >= 80 ? 'text-emerald-600' :
                                                    game.score >= 60 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {game.score !== null ? game.score : '---'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
