import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function QuizzesShow({ quiz, can_take, current_attempt }) {
    const [isLoading, setIsLoading] = useState(false);

    const getTypeLabel = (type) => {
        const labels = {
            multiple_choice: 'Multiple Choice',
            identification: 'Identification',
            true_false: 'True or False',
        };
        return labels[type] || type;
    };

    const handleStart = () => {
        setIsLoading(true);
        if (current_attempt) {
            router.visit(route('student.quizzes.take', current_attempt.id));
        } else {
            router.post(route('student.quizzes.start', quiz.id), {}, {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {quiz.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                        Back to Quizzes
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={quiz.title} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Quiz Information ===== */}
                    <Card>
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {quiz.subject}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {getTypeLabel(quiz.type)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    👨‍🏫 {quiz.teacher}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {quiz.title}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quiz.questions}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
                                </div>
                                {quiz.time_limit && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{quiz.time_limit}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Minutes</div>
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{quiz.passing_score || 75}%</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Passing Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{quiz.attempts_allowed}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Attempts Allowed</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {quiz.instructions}
                                </p>
                            </div>

                            {!can_take && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 font-medium">
                                        ⚠️ You have reached the maximum number of attempts for this quiz.
                                    </p>
                                </div>
                            )}

                            {can_take && current_attempt && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-yellow-700 dark:text-yellow-300">
                                        ⏳ You have an in-progress attempt (Attempt {current_attempt.attempt_number}).
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                                    Cancel
                                </SecondaryButton>
                                {can_take && (
                                    <PrimaryButton onClick={handleStart} disabled={isLoading}>
                                        {isLoading ? 'Loading...' : current_attempt ? 'Continue Quiz' : 'Start Quiz'}
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
