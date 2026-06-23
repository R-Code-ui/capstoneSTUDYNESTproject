import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function QuizzesResults({ attempt, quiz, questions }) {
    const [showAnswers, setShowAnswers] = useState(false);

    const passed = attempt.passed;
    const percentage = attempt.percentage;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Quiz Results: {quiz.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                        Back to Quizzes
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={`Results: ${quiz.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* ===== Score Card ===== */}
                    <Card className={`text-center ${passed ? 'border-green-500' : 'border-red-500'} border-t-4`}>
                        <div className="py-4">
                            <div className="text-6xl mb-4">
                                {passed ? '🎉' : '😅'}
                            </div>
                            <div className="text-5xl font-bold text-gray-900 dark:text-white">
                                {attempt.percentage}%
                            </div>
                            <div className="text-2xl font-semibold mt-2">
                                {attempt.score} / {attempt.total}
                            </div>
                            <div className={`mt-3 inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                                passed
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                                {passed ? '✅ Passed' : '❌ Failed'}
                            </div>
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Attempt {attempt.attempt_number} • Completed {attempt.completed_at}
                            </div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Passing Score: {quiz.passing_score}%
                            </div>
                        </div>
                    </Card>

                    {/* ===== Statistics ===== */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attempt.score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{attempt.total - attempt.score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Incorrect Answers</div>
                        </Card>
                    </div>

                    {/* ===== Toggle Answers Button ===== */}
                    <div className="mt-6 flex justify-center">
                        <PrimaryButton onClick={() => setShowAnswers(!showAnswers)}>
                            {showAnswers ? 'Hide Answers' : 'Show Answers'}
                        </PrimaryButton>
                    </div>

                    {/* ===== Question Review ===== */}
                    {showAnswers && (
                        <div className="mt-6 space-y-4">
                            {questions.map((question, index) => (
                                <Card
                                    key={index}
                                    className={`border-l-4 ${
                                        question.is_correct
                                            ? 'border-green-500'
                                            : 'border-red-500'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 text-lg font-semibold text-gray-500 dark:text-gray-400">
                                            {index + 1}.
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {question.text}
                                            </div>
                                            <div className="mt-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 dark:text-gray-400">Your Answer:</span>
                                                    <span className={question.is_correct ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                                                        {question.user_answer || 'Not answered'}
                                                        {question.is_correct ? ' ✅' : ' ❌'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-gray-500 dark:text-gray-400">Correct Answer:</span>
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        {question.correct_answer}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 text-2xl">
                                            {question.is_correct ? '✅' : '❌'}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* ===== Actions ===== */}
                    <div className="mt-6 flex justify-center gap-3">
                        <SecondaryButton onClick={() => router.visit(route('student.quizzes.index'))}>
                            Back to Quizzes
                        </SecondaryButton>
                        {attempt.attempt_number < quiz.attempts_allowed && !passed && (
                            <PrimaryButton onClick={() => router.post(route('student.quizzes.start', quiz.id))}>
                                Retry Quiz
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
