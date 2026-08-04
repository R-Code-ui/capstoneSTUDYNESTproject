import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ChartBarIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function QuizzesShow({ quiz }) {
    const getTypeLabel = (type) => {
        const labels = {
            multiple_choice: 'Multiple Choice',
            identification: 'Identification',
            true_false: 'True or False',
        };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {quiz.quiz_title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('teacher.quizzes.results', quiz.id)}>
                            <SecondaryButton>
                                <ChartBarIcon className="w-4 h-4 mr-1" />
                                Results
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.quizzes.edit', quiz.id)}>
                            <SecondaryButton>
                                <PencilSquareIcon className="w-4 h-4 mr-1" />
                                Edit
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.quizzes.index')}>
                            <PrimaryButton>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to List
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={quiz.quiz_title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{quiz.grade_level}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</div>
                                    <div className="font-medium text-gray-800">{quiz.subject}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</div>
                                    <div className="font-medium text-gray-800">{getTypeLabel(quiz.quiz_type)}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={quiz.status} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Questions</div>
                                    <div className="font-medium text-gray-800">{quiz.total_questions}</div>
                                </div>
                                {/* ❌ Removed Attempts Allowed */}
                                {quiz.time_limit && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Time Limit</div>
                                        <div className="font-medium text-gray-800">{quiz.time_limit} minutes</div>
                                    </div>
                                )}
                                {quiz.passing_score && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Passing Score</div>
                                        <div className="font-medium text-gray-800">{quiz.passing_score}%</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Shuffle Questions</div>
                                    <div className="font-medium text-gray-800">{quiz.shuffle_questions ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{quiz.publish_date}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</div>
                                    <div className="font-medium text-gray-800">{quiz.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Questions ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Questions</h3>
                            </div>
                            <div className="p-6">
                                {quiz.questions?.length === 0 ? (
                                    <p className="text-gray-500">No questions available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {quiz.questions?.map((question, index) => (
                                            <div
                                                key={question.id || index}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="font-medium text-gray-800">
                                                        {index + 1}.
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">
                                                            {question.question_text}
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-500">
                                                            Type: {getTypeLabel(question.question_type)}
                                                        </div>
                                                        {/* Multiple Choice Options */}
                                                        {question.question_type === 'multiple_choice' && (
                                                            <div className="mt-2 space-y-1 text-sm">
                                                                <div className={question.correct_answer === 'A' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    A. {question.choice_a}
                                                                    {question.correct_answer === 'A' && ' ✅'}
                                                                </div>
                                                                <div className={question.correct_answer === 'B' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    B. {question.choice_b}
                                                                    {question.correct_answer === 'B' && ' ✅'}
                                                                </div>
                                                                <div className={question.correct_answer === 'C' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    C. {question.choice_c}
                                                                    {question.correct_answer === 'C' && ' ✅'}
                                                                </div>
                                                                <div className={question.correct_answer === 'D' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    D. {question.choice_d}
                                                                    {question.correct_answer === 'D' && ' ✅'}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Identification */}
                                                        {question.question_type === 'identification' && (
                                                            <div className="mt-2 text-sm">
                                                                <span className="text-gray-500">Answer: </span>
                                                                <span className="font-medium text-gray-800">{question.correct_answer}</span>
                                                                {question.alternative_answers?.length > 0 && (
                                                                    <span className="text-gray-500">
                                                                        {' '}(or {question.alternative_answers.join(', ')})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* True/False */}
                                                        {question.question_type === 'true_false' && (
                                                            <div className="mt-2 text-sm">
                                                                <span className="text-gray-500">Answer: </span>
                                                                <span className="font-medium text-gray-800">{question.correct_answer}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
