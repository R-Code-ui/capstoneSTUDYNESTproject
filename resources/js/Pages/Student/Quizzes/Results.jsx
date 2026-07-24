import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function QuizzesResults({ attempt, quiz, questions }) {
    const [showAnswers, setShowAnswers] = useState(false);
    const passed = attempt.passed;
    const percentage = attempt.percentage;

    return (
        <AuthenticatedLayout
            header={
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        Quiz Results: {quiz.title}
                    </span>
                    <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Quizzes
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={`Results: ${quiz.title}`} />

            <div className="py-4">
                <div className="mx-auto max-w-3xl">
                    {/* ===== Score Card ===== */}
                    <div className={`bg-white rounded-xl border ${passed ? 'border-emerald-500' : 'border-red-500'} border-t-4 shadow-sm overflow-hidden`}>
                        <div className="p-6 text-center py-8">
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
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                                <CheckCircleIcon className="w-5 h-5" />
                                {attempt.score}
                            </div>
                            <div className="text-sm font-medium text-gray-500">Correct Answers</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                                <XCircleIcon className="w-5 h-5" />
                                {attempt.total - attempt.score}
                            </div>
                            <div className="text-sm font-medium text-gray-500">Incorrect Answers</div>
                        </div>
                    </div>

                    {/* ===== Toggle Answers Button ===== */}
                    <div className="mt-6 flex justify-center">
                        <PrimaryButton onClick={() => setShowAnswers(!showAnswers)}>
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
                                    className={`bg-white rounded-xl border-l-4 ${
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
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">
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
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                            Back to Quizzes
                        </SecondaryButton>
                        {attempt.attempt_number < quiz.attempts_allowed && !passed && (
                            <PrimaryButton onClick={() => router.post(route('student.quizzes.start', quiz.id))}>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Retry Quiz
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
