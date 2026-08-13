import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PuzzlePieceIcon,
    LinkIcon,
    VideoCameraIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function LessonsShow({ lesson, completion_records = [] }) {
    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf_module': return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-emerald-500" />;
            case 'worksheet': return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
            case 'url': return <LinkIcon className="w-6 h-6 text-purple-500" />;
            case 'video': return <VideoCameraIcon className="w-6 h-6 text-indigo-500" />;
            default: return <PaperClipIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const getResourceLabel = (type) => {
        const labels = {
            pdf_module: 'PDF Module',
            worksheet: 'Worksheet',
            image: 'Image',
            url: 'External Link',
            video: 'Video',
        };
        return labels[type] || type;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isUrlResource = (type) => type === 'url';
    const isVideoResource = (type) => type === 'video';

    const handleView = (resourceId) => {
        window.open(route('teacher.lessons.view-resource', resourceId), '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {lesson.lesson_title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('teacher.lessons.edit', lesson.id)}>
                            <SecondaryButton>
                                <PencilSquareIcon className="w-4 h-4 mr-1" />
                                Edit
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.lessons.index')}>
                            <PrimaryButton>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to List
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={lesson.lesson_title} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">

                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{lesson.grade_level}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</div>
                                    <div className="font-medium text-gray-800">{lesson.subject}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={lesson.status} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{lesson.publish_date}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">School Year</div>
                                    <div className="font-medium text-gray-800">{lesson.school_year}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Term</div>
                                    <div className="font-medium text-gray-800">{lesson.trimester}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Week</div>
                                    <div className="font-medium text-gray-800">{lesson.week_number}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</div>
                                    <div className="font-medium text-gray-800">{lesson.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOW Reference */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">BOW Reference</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Learning Competency</div>
                                    <div className="text-gray-800">{lesson.learning_competency}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Learning Objective</div>
                                    <div className="text-gray-800">{lesson.learning_objective}</div>
                                </div>
                                {lesson.bow_code && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">BOW Code</div>
                                        <div className="text-gray-800 font-mono">{lesson.bow_code}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Lesson Description</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-gray-700 whitespace-pre-wrap">{lesson.lesson_description}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Lesson Content</h3>
                            </div>
                            <div className="p-6">
                                <div className="prose prose-blue max-w-none text-gray-700">
                                    <div dangerouslySetInnerHTML={{ __html: lesson.lesson_content }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {lesson.key_takeaways && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Key Takeaways</h3>
                                </div>
                                <div className="p-6">
                                    <div className="text-gray-700 whitespace-pre-wrap">{lesson.key_takeaways}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Learning Resources</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {lesson.resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 gap-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getResourceIcon(resource.type)}
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {resource.name}
                                                    </div>
                                                    {!isUrlResource(resource.type) && (
                                                        <div className="text-sm text-gray-500">
                                                            {getResourceLabel(resource.type)} • {formatFileSize(resource.size)}
                                                        </div>
                                                    )}
                                                    {isUrlResource(resource.type) && (
                                                        <div className="text-sm text-gray-500">External Link</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {isUrlResource(resource.type) ? (
                                                    <a
                                                        href={resource.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                        Open Link
                                                    </a>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleView(resource.id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                                                            <EyeIcon className="w-4 h-4" /> View
                                                        </button>
                                                        <a href={route('teacher.lessons.download-resource', resource.id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                                            <ArrowDownTrayIcon className="w-4 h-4" /> Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Student Completion Records</h3>
                        </div>
                        <div className="p-6">
                            {completion_records.length === 0 ? (
                                <p className="text-sm text-gray-500">No students have completed this lesson yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead><tr className="border-b text-left text-gray-500"><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Grade Level</th><th className="py-2">Completed At</th></tr></thead>
                                        <tbody>{completion_records.map((record) => <tr key={record.id} className="border-b last:border-0"><td className="py-3 pr-4 font-medium text-gray-800">{record.name}</td><td className="py-3 pr-4 text-gray-600">{record.grade_level}</td><td className="py-3 text-gray-600">{record.completed_at || 'N/A'}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Activities */}
                    {(lesson.related_assignment_id || lesson.related_quiz_id || lesson.related_game_id) && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Related Activities</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-3">
                                        {lesson.related_assignment_id && (
                                            <Link
                                                href={route('teacher.assignments.show', lesson.related_assignment_id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
                                            >
                                                <DocumentTextIcon className="w-4 h-4" />
                                                Open Assignment
                                            </Link>
                                        )}
                                        {lesson.related_quiz_id && (
                                            <Link
                                                href={route('teacher.quizzes.show', lesson.related_quiz_id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                            >
                                                <ChartBarIcon className="w-4 h-4" />
                                                Take Quiz
                                            </Link>
                                        )}
                                        {lesson.related_game_id && (
                                            <Link
                                                href={route('teacher.games.show', lesson.related_game_id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                                            >
                                                <PuzzlePieceIcon className="w-4 h-4" />
                                                Play Game
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
