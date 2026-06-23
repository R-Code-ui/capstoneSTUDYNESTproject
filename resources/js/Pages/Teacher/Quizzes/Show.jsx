import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {quiz.quiz_title}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('teacher.quizzes.results', quiz.id)}>
                            <SecondaryButton>📊 Results</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.quizzes.edit', quiz.id)}>
                            <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.quizzes.index')}>
                            <PrimaryButton>Back to List</PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={quiz.quiz_title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Grade Level</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.grade_level}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Subject</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.subject}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
                                <div className="font-medium text-gray-900 dark:text-white">{getTypeLabel(quiz.quiz_type)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <StatusBadge status={quiz.status} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Questions</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.total_questions}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Attempts Allowed</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.attempts_allowed}</div>
                            </div>
                            {quiz.time_limit && (
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Time Limit</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{quiz.time_limit} minutes</div>
                                </div>
                            )}
                            {quiz.passing_score && (
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Passing Score</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{quiz.passing_score}%</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Shuffle Questions</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.shuffle_questions ? 'Yes' : 'No'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Publish Date</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.publish_date}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Created At</div>
                                <div className="font-medium text-gray-900 dark:text-white">{quiz.created_at}</div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Questions ===== */}
                    <div className="mt-6">
                        <Card title="Questions">
                            {quiz.questions?.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No questions available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {quiz.questions?.map((question, index) => (
                                        <div
                                            key={question.id || index}
                                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {question.question_text}
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        Type: {getTypeLabel(question.question_type)}
                                                    </div>

                                                    {/* Multiple Choice Options */}
                                                    {question.question_type === 'multiple_choice' && (
                                                        <div className="mt-2 space-y-1 text-sm">
                                                            <div className={question.correct_answer === 'A' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                                A. {question.choice_a}
                                                                {question.correct_answer === 'A' && ' ✅'}
                                                            </div>
                                                            <div className={question.correct_answer === 'B' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                                B. {question.choice_b}
                                                                {question.correct_answer === 'B' && ' ✅'}
                                                            </div>
                                                            <div className={question.correct_answer === 'C' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                                C. {question.choice_c}
                                                                {question.correct_answer === 'C' && ' ✅'}
                                                            </div>
                                                            <div className={question.correct_answer === 'D' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                                D. {question.choice_d}
                                                                {question.correct_answer === 'D' && ' ✅'}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Identification */}
                                                    {question.question_type === 'identification' && (
                                                        <div className="mt-2 text-sm">
                                                            <span className="text-gray-500 dark:text-gray-400">Answer: </span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{question.correct_answer}</span>
                                                            {question.alternative_answers?.length > 0 && (
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    {' '}(or {question.alternative_answers.join(', ')})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* True/False */}
                                                    {question.question_type === 'true_false' && (
                                                        <div className="mt-2 text-sm">
                                                            <span className="text-gray-500 dark:text-gray-400">Answer: </span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{question.correct_answer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
