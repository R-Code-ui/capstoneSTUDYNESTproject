import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Pagination from '@/Components/Pagination';
import { toast } from 'sonner';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ChartBarIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function QuizzesShow({ quiz, questions = [], questionsPagination }) {
    const handleNavigationError = () => toast.error('Unable to load that page. Please try again.');
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
                <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                        <Link
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                            href={route('teacher.quizzes.index')}
                            onError={handleNavigationError}
                            aria-label="Back to Quizzes"
                            title="Back to Quizzes"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Link>
                        <span className="quiz-show-title min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-800" title={quiz.quiz_title}>
                            {quiz.quiz_title}
                        </span>
                    </div>
                    <div className="flex w-full flex-row flex-wrap justify-end gap-2 xl:ml-auto xl:w-auto xl:shrink-0">
                        <Link className="w-auto" href={route('teacher.quizzes.results', quiz.id)} onError={handleNavigationError}>
                            <SecondaryButton className="min-h-11 w-auto justify-center">
                                <ChartBarIcon className="mr-1 h-4 w-4" />
                                View Results
                            </SecondaryButton>
                        </Link>
                        <Link className="w-auto" href={route('teacher.quizzes.edit', quiz.id)} onError={handleNavigationError}>
                            <PrimaryButton className="min-h-11 w-auto justify-center">
                                <PencilSquareIcon className="mr-1 h-4 w-4" />
                                Edit Quiz
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={quiz.quiz_title} />
            <style>{`
                .quiz-show-title {
                    display: block;
                    min-width: 0;
                    max-width: min(100%, 48rem);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .quiz-readable-text {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 3;
                    overflow: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    text-overflow: ellipsis;
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{quiz.grade_level}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</div>
                                    <div className="font-medium text-gray-800">{quiz.subject}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</div>
                                    <div className="font-medium text-gray-800">{getTypeLabel(quiz.quiz_type)}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={quiz.status} />
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Questions</div>
                                    <div className="font-medium text-gray-800">{quiz.total_questions}</div>
                                </div>
                                {/* ✅ Display Attempts Allowed (total including practice) */}
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Allowed Attempts (incl. practice)
                                    </div>
                                    <div className="font-medium text-gray-800">{quiz.attempts_allowed}</div>
                                </div>
                                {quiz.time_limit && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Time Limit</div>
                                        <div className="font-medium text-gray-800">{quiz.time_limit} minutes</div>
                                    </div>
                                )}
                                {quiz.passing_score && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Passing Score</div>
                                        <div className="font-medium text-gray-800">{quiz.passing_score}%</div>
                                    </div>
                                )}
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Shuffle Questions</div>
                                    <div className="font-medium text-gray-800">{quiz.shuffle_questions ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{quiz.publish_date}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</div>
                                    <div className="font-medium text-gray-800">{quiz.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Questions ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700">Questions</h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                {questions.length === 0 ? (
                                    <p className="text-gray-500">No questions available.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {questions.map((question, index) => (
                                            <div
                                                key={question.id || index}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="font-medium text-gray-800">
                                                        {question.question_number || ((questionsPagination?.current_page - 1) * (questionsPagination?.per_page || 10)) + index + 1}.
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="quiz-readable-text font-medium text-gray-800" title={question.question_text}>
                                                            {question.question_text}
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-500">
                                                            Type: {getTypeLabel(question.question_type)}
                                                        </div>
                                                        {/* Multiple Choice Options */}
                                                        {question.question_type === 'multiple_choice' && (
                                                            <div className="mt-2 space-y-1 text-sm">
                                                                <div className={question.correct_answer === 'A' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    <span className="quiz-readable-text">A. {question.choice_a}</span>
                                                                    {question.correct_answer === 'A' && ' ✅'}
                                                                </div>
                                                                <div className={question.correct_answer === 'B' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    <span className="quiz-readable-text">B. {question.choice_b}</span>
                                                                    {question.correct_answer === 'B' && ' ✅'}
                                                                </div>
                                                                <div className={question.correct_answer === 'C' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    <span className="quiz-readable-text">C. {question.choice_c}</span>
                                                                    {question.correct_answer === 'C' && ' ✅'}
                                                                </div>
                                                                <div className={question.correct_answer === 'D' ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                                    <span className="quiz-readable-text">D. {question.choice_d}</span>
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
                                <Pagination pagination={questionsPagination} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
