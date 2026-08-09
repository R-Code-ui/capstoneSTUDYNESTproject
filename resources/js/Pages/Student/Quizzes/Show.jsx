import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

// Heroicons
import {
    UserIcon,
    ClockIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {quiz.title}
                    </span>
                    <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Quizzes
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={quiz.title} />

            <div className="py-4">
                <div className="mx-auto max-w-3xl">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Quiz Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {quiz.subject}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {getTypeLabel(quiz.type)}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    {quiz.teacher}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 break-words">
                                    <DocumentTextIcon className="w-6 h-6 text-blue-500 shrink-0" />
                                    {quiz.title}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{quiz.questions}</div>
                                    <div className="text-xs font-medium text-gray-500">Questions</div>
                                </div>
                                {quiz.time_limit && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
                                            <ClockIcon className="w-5 h-5" />
                                            {quiz.time_limit}
                                        </div>
                                        <div className="text-xs font-medium text-gray-500">Minutes</div>
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{quiz.passing_score || 75}%</div>
                                    <div className="text-xs font-medium text-gray-500">Passing Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{quiz.attempts_used}/{quiz.attempts_allowed}</div>
                                    <div className="text-xs font-medium text-gray-500">Attempts Used</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Instructions</h4>
                                <p className="text-gray-600 break-words">
                                    {quiz.instructions}
                                </p>
                            </div>

                            {!can_take && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                    <p className="text-red-600 font-medium">
                                        You have reached the maximum number of attempts for this quiz.
                                    </p>
                                </div>
                            )}

                            {can_take && current_attempt && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                                    <p className="text-yellow-700">
                                        You have an in-progress attempt (Attempt {current_attempt.attempt_number}).
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
