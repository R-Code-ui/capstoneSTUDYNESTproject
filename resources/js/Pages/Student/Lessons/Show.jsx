import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function LessonsShow({ lesson, related_activities }) {
    const [isLoading, setIsLoading] = useState(false);

    const getResourceIcon = (type) => {
        const icons = {
            pdf_module: '📄',
            worksheet: '📝',
            image: '🖼️',
        };
        return icons[type] || '📎';
    };

    const getResourceLabel = (type) => {
        const labels = {
            pdf_module: 'PDF Module',
            worksheet: 'Worksheet',
            image: 'Image',
        };
        return labels[type] || type;
    };

    const handleMarkComplete = () => {
        if (confirm('Mark this lesson as completed?')) {
            setIsLoading(true);
            router.post(route('student.lessons.complete', lesson.id), {}, {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const handleDownload = (resourceId, fileName) => {
        window.open(route('student.lessons.download-resource', resourceId), '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {lesson.title}
                    </h2>
                    <div className="flex gap-2">
                        {!lesson.is_completed && (
                            <PrimaryButton onClick={handleMarkComplete} disabled={isLoading}>
                                {isLoading ? 'Marking...' : '✅ Mark as Completed'}
                            </PrimaryButton>
                        )}
                        <SecondaryButton onClick={() => router.visit(route('student.lessons.index'))}>
                            Back to Lessons
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={lesson.title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Loading Spinner */}
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Lesson Information ===== */}
                    <Card>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {lesson.subject}
                                </span>
                                {lesson.is_completed && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        ✅ Completed
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    👨‍🏫 {lesson.teacher}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    📅 {lesson.publish_date}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {lesson.title}
                                </h3>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {lesson.description}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Lesson Content ===== */}
                    <div className="mt-6">
                        <Card title="📖 Lesson Content">
                            <div className="prose prose-blue dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                            </div>
                        </Card>
                    </div>

                    {/* ===== Learning Resources ===== */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <div className="mt-6">
                            <Card title="📎 Learning Resources">
                                <div className="space-y-3">
                                    {lesson.resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{getResourceIcon(resource.type)}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {resource.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {getResourceLabel(resource.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(resource.id, resource.name)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Related Activities ===== */}
                    {(related_activities.assignment || related_activities.quiz || related_activities.game) && (
                        <div className="mt-6">
                            <Card title="🔗 Related Activities">
                                <div className="flex flex-wrap gap-3">
                                    {related_activities.assignment && (
                                        <Link
                                            href={route('student.assignments.show', related_activities.assignment.id)}
                                            className="px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
                                        >
                                            📝 Open Assignment: {related_activities.assignment.title}
                                        </Link>
                                    )}
                                    {related_activities.quiz && (
                                        <Link
                                            href={route('student.quizzes.show', related_activities.quiz.id)}
                                            className="px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                                        >
                                            📊 Take Quiz: {related_activities.quiz.title}
                                        </Link>
                                    )}
                                    {related_activities.game && (
                                        <Link
                                            href={route('student.games.show', related_activities.game.id)}
                                            className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            🎮 Play Game: {related_activities.game.title}
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Completion Status ===== */}
                    {lesson.is_completed ? (
                        <div className="mt-6">
                            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                                    <span className="text-2xl">✅</span>
                                    <div>
                                        <div className="font-semibold">Lesson Completed!</div>
                                        <div className="text-sm text-green-600 dark:text-green-400">
                                            Great job! You have completed this lesson.
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-3 text-yellow-700 dark:text-yellow-300">
                                    <span className="text-2xl">📌</span>
                                    <div>
                                        <div className="font-semibold">Not Yet Completed</div>
                                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Click the "Mark as Completed" button above when you finish this lesson.
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
