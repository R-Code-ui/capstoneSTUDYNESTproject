import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

// Heroicons
import {
    CheckCircleIcon,
    XCircleIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
};

export default function QuizzesResults({ attempt, quiz, questions }) {
    const [showAnswers, setShowAnswers] = useState(false);
    const [confirmingRetry, setConfirmingRetry] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const passed = attempt.passed;
    const percentage = attempt.percentage;
    const canRetry = attempt.attempt_number < quiz.attempts_allowed;
    const startRetry = () => {
        setConfirmingRetry(false);
        setIsRetrying(true);
        router.post(route('student.quizzes.start', quiz.id), {}, {
            onSuccess: () => toast.success('New quiz attempt started.'),
            onError: () => toast.error('Unable to start another attempt. Please try again.'),
            onFinish: () => setIsRetrying(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                        onClick={() => router.visit(route('student.quizzes.index'), {
                            onError: () => toast.error('Unable to return to quizzes. Please try again.'),
                        })}
                        aria-label="Back to Quizzes"
                        title="Back to Quizzes"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                    </button>
                    <span className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-gray-800" title={quiz.title}>
                        Quiz Results: {quiz.title}
                    </span>
                </div>
            }
        >
            <Head title={`Results: ${quiz.title}`} />

            <div
                className="student-quiz-results-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6"
                onFocusCapture={keepFocusedFieldVisible}
            >
                <style>{`
                    .studynest-layout.theme-dark .student-quiz-results-page .bg-white { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .text-gray-800,
                    .studynest-layout.theme-dark .student-quiz-results-page .text-gray-700 { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .text-gray-600,
                    .studynest-layout.theme-dark .student-quiz-results-page .text-gray-500 { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page [class~="border-gray-200"] { border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary[data-result="passed"] {
                        background-image: linear-gradient(135deg, rgb(6 78 59), rgb(12 74 110)) !important;
                        background-color: rgb(6 78 59) !important;
                        border-color: rgb(52 211 153) !important;
                    }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary[data-result="failed"] {
                        background-image: linear-gradient(135deg, rgb(127 29 29), rgb(120 53 15)) !important;
                        background-color: rgb(127 29 29) !important;
                        border-color: rgb(248 113 113) !important;
                    }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary .text-gray-800 { color: rgb(248 250 252) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary .text-gray-700 { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary .text-gray-500 { color: rgb(203 213 225) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary [class~="bg-emerald-100"] { background-color: rgb(6 95 70 / .72) !important; color: rgb(209 250 229) !important; }
                    .studynest-layout.theme-dark .student-quiz-results-page .student-quiz-result-summary [class~="bg-red-100"] { background-color: rgb(127 29 29 / .72) !important; color: rgb(254 226 226) !important; }
                    .student-quiz-results-page .break-words { overflow-wrap: anywhere; word-break: break-word; }
                    .student-quiz-results-page input,
                    .student-quiz-results-page select,
                    .student-quiz-results-page textarea { scroll-margin-block: 8rem; }
                    .student-result-card { transition: transform 180ms ease, box-shadow 180ms ease; }
                    @media (max-width: 639px) {
                        .student-quiz-results-page input:not([type="checkbox"]):not([type="radio"]),
                        .student-quiz-results-page select,
                        .student-quiz-results-page textarea { font-size: 16px; }
                    }
                    @media (hover: hover) and (pointer: fine) {
                        .student-result-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(15 23 42 / 0.08); }
                    }
                    @media (hover: none), (prefers-reduced-motion: reduce) {
                        .student-result-card { transform: none !important; transition-duration: 0.01ms !important; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {/* ===== Score Card ===== */}
                    <div
                        data-result={passed ? 'passed' : 'failed'}
                        className={`student-quiz-result-summary student-result-card overflow-hidden rounded-2xl border ${passed ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-sky-50' : 'border-red-500 bg-gradient-to-br from-rose-50 to-amber-50'} border-t-4 shadow-sm`}
                    >
                        <div className="px-4 py-7 text-center sm:p-8">
                            <h1 className="mb-4 break-words text-xl font-bold text-gray-800 xl:hidden">{quiz.title}</h1>
                            <div className="text-6xl mb-4">
                                {passed ? (
                                    <CheckCircleIcon className="w-20 h-20 mx-auto text-emerald-500" />
                                ) : (
                                    <XCircleIcon className="w-20 h-20 mx-auto text-red-500" />
                                )}
                            </div>
                            <div className="text-5xl font-bold text-gray-800">
                                {attempt.percentage}%
                            </div>
                            <div className="text-2xl font-semibold mt-2 text-gray-700">
                                {attempt.score} / {attempt.total}
                            </div>
                            <div className={`mt-3 inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                                passed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {passed ? (
                                    <><CheckCircleIcon className="w-5 h-5 mr-1" /> Passed</>
                                ) : (
                                    <><XCircleIcon className="w-5 h-5 mr-1" /> Failed</>
                                )}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                Attempt {attempt.attempt_number} • Completed {attempt.completed_at}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                                Passing Score: {quiz.passing_score}%
                            </div>
                        </div>
                    </div>

                    {/* ===== Statistics ===== */}
                    <div className="mt-4 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:mt-6 sm:gap-4">
                        <div className="student-result-card rounded-2xl border border-blue-200 bg-white p-4 text-center shadow-sm">
                            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                                <CheckCircleIcon className="w-5 h-5" />
                                {attempt.score}
                            </div>
                            <div className="text-sm font-medium text-gray-500">Correct Answers</div>
                        </div>
                        <div className="student-result-card rounded-2xl border border-rose-200 bg-white p-4 text-center shadow-sm">
                            <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                                <XCircleIcon className="w-5 h-5" />
                                {attempt.total - attempt.score}
                            </div>
                            <div className="text-sm font-medium text-gray-500">Incorrect Answers</div>
                        </div>
                    </div>

                    {/* ===== Toggle Answers Button ===== */}
                    <div className="mt-6 flex justify-center">
                        <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={() => setShowAnswers(!showAnswers)}>
                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                            {showAnswers ? 'Hide Answers' : 'Show Answers'}
                        </PrimaryButton>
                    </div>

                    {/* ===== Question Review ===== */}
                    {showAnswers && (
                        <div className="mt-6 space-y-4">
                            {questions.map((question, index) => (
                                <div
                                    key={index}
                                    className={`student-result-card overflow-hidden rounded-2xl border-l-4 bg-white ${
                                        question.is_correct
                                            ? 'border-emerald-500'
                                            : 'border-red-500'
                                    } border border-gray-200 shadow-sm overflow-hidden`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 text-lg font-semibold text-gray-500">
                                                {index + 1}.
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-gray-800 break-words" title={question.text}>
                                                    {question.text}
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-gray-500">Your Answer:</span>
                                                        <span className={question.is_correct ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                                                            {question.user_answer || 'Not answered'}
                                                            {question.is_correct ? ' ✅' : ' ❌'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-gray-500">Correct Answer:</span>
                                                        <span className="text-emerald-600 font-medium">
                                                            {question.correct_answer}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {question.is_correct ? (
                                                    <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                                ) : (
                                                    <XCircleIcon className="w-6 h-6 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ===== Actions ===== */}
                    {canRetry && (
                    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex justify-center gap-3 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                        {/* ✅ Only one back button here – header already has one, so we removed the duplicate */}
                            <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={() => setConfirmingRetry(true)} disabled={isRetrying}>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                {isRetrying ? 'Starting...' : 'Retry Quiz'}
                            </PrimaryButton>
                    </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                show={confirmingRetry}
                onClose={() => setConfirmingRetry(false)}
                onConfirm={startRetry}
                title="Start another attempt?"
                message="Starting another attempt uses one of your remaining quiz attempts."
                confirmText="Start attempt"
                cancelText="Cancel"
                confirmColor="blue"
            />
        </AuthenticatedLayout>
    );
}
