import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';

// Heroicons
import {
    UserIcon,
    ClockIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
};

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
            router.visit(route('student.quizzes.take', current_attempt.id), {
                onError: () => toast.error('Unable to continue this quiz. Please try again.'),
                onFinish: () => setIsLoading(false),
            });
        } else {
            router.post(route('student.quizzes.start', quiz.id), {}, {
                preserveState: true,
                onSuccess: () => toast.success('Quiz started.'),
                onError: () => toast.error('Unable to start the quiz. Please try again.'),
                onFinish: () => setIsLoading(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center">
                    <span className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-gray-800" title={quiz.title}>
                        {quiz.title}
                    </span>
                </div>
            }
        >
            <Head title={quiz.title} />

            <div
                className="student-quiz-show-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6"
                onFocusCapture={keepFocusedFieldVisible}
            >
                <style>{`
                    .studynest-layout.theme-dark .student-quiz-show-page .bg-white { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page .bg-gray-50 { background-color: rgb(30 41 59) !important; border-color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page .bg-red-50 { background-color: rgb(69 26 26) !important; border-color: rgb(127 29 29) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page .bg-yellow-50 { background-color: rgb(66 50 20) !important; border-color: rgb(146 105 28) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page .text-gray-800,
                    .studynest-layout.theme-dark .student-quiz-show-page .text-gray-700 { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page .text-gray-600,
                    .studynest-layout.theme-dark .student-quiz-show-page .text-gray-500 { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page [class~="border-gray-200"],
                    .studynest-layout.theme-dark .student-quiz-show-page [class~="border-gray-100"] { border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-show-page .student-quiz-action-bar {
                        background-color: rgb(15 23 42 / .97) !important;
                        border-color: rgb(51 65 85) !important;
                    }
                    .studynest-layout.theme-dark .student-quiz-show-page .student-quiz-action-bar .studynest-secondary-button {
                        border-color: rgb(71 85 105) !important;
                        background-color: rgb(30 41 59) !important;
                        color: rgb(226 232 240) !important;
                    }
                    .student-quiz-show-page .break-words { overflow-wrap: anywhere; word-break: break-word; }
                    .student-quiz-show-page input,
                    .student-quiz-show-page select,
                    .student-quiz-show-page textarea { scroll-margin-block: 8rem; }
                    .student-quiz-info-card { transition: transform 180ms ease, box-shadow 180ms ease; }
                    @media (max-width: 639px) {
                        .student-quiz-show-page input:not([type="checkbox"]):not([type="radio"]),
                        .student-quiz-show-page select,
                        .student-quiz-show-page textarea { font-size: 16px; }
                    }
                    @media (hover: hover) and (pointer: fine) {
                        .student-quiz-info-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(15 23 42 / 0.08); }
                    }
                    @media (hover: none), (prefers-reduced-motion: reduce) {
                        .student-quiz-info-card { transform: none !important; transition-duration: 0.01ms !important; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Quiz Information ===== */}
                    <div className="student-quiz-info-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="space-y-5 p-4 sm:p-6">
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

                            <div className="xl:hidden">
                                <h1 className="flex min-w-0 max-w-full items-start gap-2 break-words text-xl font-bold text-gray-800 sm:text-2xl" title={quiz.title}>
                                    <DocumentTextIcon className="w-6 h-6 text-blue-500 shrink-0" />
                                    {quiz.title}
                                </h1>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4 xl:grid-cols-4">
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
                                <p className="whitespace-pre-wrap text-gray-600 break-words" title={quiz.instructions}>
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

                            <div className="student-quiz-action-bar sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0">
                                <SecondaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={() => router.visit(route('student.quizzes.index'), {
                                    onError: () => toast.error('Unable to return to quizzes. Please try again.'),
                                })}>
                                    Cancel
                                </SecondaryButton>
                                {can_take && (
                                    <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={handleStart} disabled={isLoading}>
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
