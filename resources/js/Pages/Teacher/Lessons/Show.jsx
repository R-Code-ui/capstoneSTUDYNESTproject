import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function LessonsShow({ lesson }) {
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

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {lesson.lesson_title}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('teacher.lessons.edit', lesson.id)}>
                            <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.lessons.index')}>
                            <PrimaryButton>Back to List</PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={lesson.lesson_title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Grade Level</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.grade_level}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Subject</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.subject}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <StatusBadge status={lesson.status} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Publish Date</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.publish_date}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">School Year</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.school_year}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Trimester</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.trimester}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Week</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.week_number}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Created At</div>
                                <div className="font-medium text-gray-900 dark:text-white">{lesson.created_at}</div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== BOW Reference ===== */}
                    <div className="mt-6">
                        <Card title="BOW Reference">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Learning Competency</div>
                                    <div className="text-gray-900 dark:text-white">{lesson.learning_competency}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Learning Objective</div>
                                    <div className="text-gray-900 dark:text-white">{lesson.learning_objective}</div>
                                </div>
                                {lesson.bow_code && (
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">BOW Code</div>
                                        <div className="text-gray-900 dark:text-white font-mono">{lesson.bow_code}</div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* ===== Lesson Content ===== */}
                    <div className="mt-6">
                        <Card title="Lesson Description">
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {lesson.lesson_description}
                            </div>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Card title="Lesson Content">
                            <div className="prose prose-blue dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: lesson.lesson_content }} />
                            </div>
                        </Card>
                    </div>

                    {lesson.key_takeaways && (
                        <div className="mt-6">
                            <Card title="Key Takeaways">
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {lesson.key_takeaways}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Learning Resources ===== */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <div className="mt-6">
                            <Card title="Learning Resources">
                                <div className="space-y-3">
                                    {lesson.resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {resource.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {getResourceLabel(resource.type)} • {formatFileSize(resource.size)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href={route('teacher.lessons.download-resource', resource.id)}
                                                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Related Activities ===== */}
                    {(lesson.related_assignment_id || lesson.related_quiz_id || lesson.related_game_id) && (
                        <div className="mt-6">
                            <Card title="Related Activities">
                                <div className="flex flex-wrap gap-3">
                                    {lesson.related_assignment_id && (
                                        <Link
                                            href={route('teacher.assignments.show', lesson.related_assignment_id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                                        >
                                            📝 Open Assignment
                                        </Link>
                                    )}
                                    {lesson.related_quiz_id && (
                                        <Link
                                            href={route('teacher.quizzes.show', lesson.related_quiz_id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            📊 Take Quiz
                                        </Link>
                                    )}
                                    {lesson.related_game_id && (
                                        <Link
                                            href={route('teacher.games.show', lesson.related_game_id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            🎮 Play Game
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
