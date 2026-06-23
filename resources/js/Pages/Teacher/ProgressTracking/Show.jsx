import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import SecondaryButton from '@/Components/SecondaryButton';

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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Student Progress: {student.name}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('teacher.progress.index'))}>
                        Back to Progress List
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={`Progress: ${student.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Student Information ===== */}
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Student Name</div>
                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">LRN</div>
                                <div className="font-medium text-gray-900 dark:text-white">{student.lrn}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Grade Level</div>
                                <div className="font-medium text-gray-900 dark:text-white">{student.grade_level}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progress.overall_progress}%
                                    </span>
                                    <StatusBadge status={getStatusBadge(progress.overall_progress)} />
                                </div>
                            </div>
                        </div>

                        {/* Overall Progress Bar */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {progress.overall_progress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                <div
                                    className={`h-4 rounded-full transition-all duration-500 ${
                                        progress.overall_progress >= 80 ? 'bg-green-500' :
                                        progress.overall_progress >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${progress.overall_progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Needs Support (0-59%)</span>
                                <span>Needs Monitoring (60-79%)</span>
                                <span>Excellent (80-100%)</span>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Progress Breakdown ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Lessons */}
                        <Card title="📚 Lessons">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progress.lessons.completed} / {progress.lessons.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.lessons.percentage}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                    {progress.lessons.percentage}%
                                </div>
                            </div>
                        </Card>

                        {/* Assignments */}
                        <Card title="📝 Assignments">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Submitted</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progress.assignments.submitted} / {progress.assignments.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.assignments.percentage}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                    {progress.assignments.percentage}%
                                </div>
                            </div>
                        </Card>

                        {/* Quizzes */}
                        <Card title="📊 Quizzes">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progress.quizzes.attempts} / {progress.quizzes.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-purple-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.quizzes.total > 0 ? (progress.quizzes.attempts / progress.quizzes.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Avg Score</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progress.quizzes.average_score}%
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Games */}
                        <Card title="🎮 Games">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progress.games.completed} / {progress.games.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-orange-500 h-2.5 rounded-full"
                                        style={{ width: `${progress.games.total > 0 ? (progress.games.completed / progress.games.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Quiz Performance Detail ===== */}
                    {progress.quizzes.performance && progress.quizzes.performance.length > 0 && (
                        <div className="mt-6">
                            <Card title="📊 Quiz Performance Details">
                                <div className="space-y-3">
                                    {progress.quizzes.performance.map((quiz, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {quiz.quiz_title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {quiz.completed_at || 'Not yet completed'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${
                                                    quiz.percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                                                    quiz.percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {quiz.score}/{quiz.total}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {quiz.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Game Performance Detail ===== */}
                    {progress.games.performance && progress.games.performance.length > 0 && (
                        <div className="mt-6">
                            <Card title="🎮 Game Performance Details">
                                <div className="space-y-3">
                                    {progress.games.performance.map((game, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {game.game_title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {game.game_type?.charAt(0).toUpperCase() + game.game_type?.slice(1)}
                                                    {game.completed_at && ` • ${game.completed_at}`}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${
                                                    game.score >= 80 ? 'text-green-600 dark:text-green-400' :
                                                    game.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {game.score !== null ? game.score : '—'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
