import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    DocumentTextIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export default function AttemptDetails({ attempt, questions, quiz_title }) {
    const getTypeLabel = (type) => {
        const labels = {
            multiple_choice: 'Multiple Choice',
            identification: 'Identification',
            true_false: 'True or False',
        };
        return labels[type] || type;
    };

    const getStatusColor = (isCorrect) => {
        return isCorrect
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';
    };

    const calculatePercentage = () => {
        if (attempt.total_questions === 0) return 0;
        return Math.round((attempt.score / attempt.total_questions) * 100);
    };

    const percentage = calculatePercentage();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Attempt Details: {quiz_title}
                    </span>
                    <Link href={route('teacher.quizzes.results', attempt.quiz_id)}>
                        <SecondaryButton>
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Results
                        </SecondaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={`Attempt Details: ${attempt.student_name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Student Information ===== */}
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Student</div>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    {attempt.student_name}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">LRN</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {attempt.student_lrn}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {attempt.score} / {attempt.total_questions}
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({percentage}%)
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <StatusBadge
                                    status={attempt.status === 'completed' ? 'completed' : 'in_progress'}
                                    label={attempt.status === 'completed' ? 'Completed' : 'In Progress'}
                                />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Attempt Number</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    Attempt {attempt.attempt_number}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Completed At</div>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    {attempt.completed_at || 'Not completed yet'}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Questions and Answers ===== */}
                    <div className="mt-6">
                        <Card title="Question-by-Question Breakdown">
                            {questions.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No questions found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {questions.map((question, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        Q{question.question_number}.
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {question.question_text}
                                                        </div>
                                                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            Type: {getTypeLabel(question.question_type)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                                    {question.is_correct ? (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                            Correct
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                            <XCircleIcon className="w-5 h-5" />
                                                            Incorrect
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Multiple Choice Options */}
                                            {question.question_type === 'multiple_choice' && question.choices && (
                                                <div className="mt-3 ml-8 space-y-1 text-sm">
                                                    <div className={question.correct_answer === 'A' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                        A. {question.choices.A}
                                                        {question.correct_answer === 'A' && ' ✅'}
                                                    </div>
                                                    <div className={question.correct_answer === 'B' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                        B. {question.choices.B}
                                                        {question.correct_answer === 'B' && ' ✅'}
                                                    </div>
                                                    <div className={question.correct_answer === 'C' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                        C. {question.choices.C}
                                                        {question.correct_answer === 'C' && ' ✅'}
                                                    </div>
                                                    <div className={question.correct_answer === 'D' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                        D. {question.choices.D}
                                                        {question.correct_answer === 'D' && ' ✅'}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                        <span className="text-gray-500 dark:text-gray-400">Your answer: </span>
                                                        <span className={question.user_answer ? getStatusColor(question.is_correct) : 'text-gray-400'}>
                                                            {question.user_answer || 'Not answered'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Identification */}
                                            {question.question_type === 'identification' && (
                                                <div className="mt-3 ml-8 text-sm">
                                                    <div className="space-y-1">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Correct answer: </span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {question.correct_answer}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Your answer: </span>
                                                            <span className={question.user_answer ? getStatusColor(question.is_correct) : 'text-gray-400'}>
                                                                {question.user_answer || 'Not answered'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* True/False */}
                                            {question.question_type === 'true_false' && (
                                                <div className="mt-3 ml-8 text-sm">
                                                    <div className="space-y-1">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Correct answer: </span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {question.correct_answer}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Your answer: </span>
                                                            <span className={question.user_answer ? getStatusColor(question.is_correct) : 'text-gray-400'}>
                                                                {question.user_answer || 'Not answered'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Summary ===== */}
                    <div className="mt-6">
                        <Card title="Summary">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {questions.filter(q => q.is_correct).length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {questions.filter(q => !q.is_correct && q.user_answer).length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Incorrect</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {questions.filter(q => !q.user_answer).length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Unanswered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {percentage}%
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Percentage</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
