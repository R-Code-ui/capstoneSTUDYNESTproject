import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

// Heroicons
import {
    ArrowLeftIcon,
    BookOpenIcon,
    UserIcon,
    CalendarIcon,
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    PuzzlePieceIcon,
    LinkIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function LessonsShow({ lesson, related_activities }) {
    const [isLoading, setIsLoading] = useState(false);

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf_module': return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-emerald-500" />;
            case 'worksheet': return <PaperClipIcon className="w-6 h-6 text-blue-500" />;
            case 'url': return <LinkIcon className="w-6 h-6 text-purple-500" />;
            default: return <PaperClipIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const getResourceLabel = (type) => {
        const labels = {
            pdf_module: 'PDF Module',
            worksheet: 'Worksheet',
            image: 'Image',
            url: 'External Link',
        };
        return labels[type] || type;
    };

    const isUrlResource = (type) => type === 'url';

    const handleMarkComplete = () => {
        if (confirm('Mark this lesson as completed?')) {
            setIsLoading(true);
            router.post(route('student.lessons.complete', lesson.id), {}, {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const handleDownload = (resourceId) => {
        window.open(route('student.lessons.download-resource', resourceId), '_blank');
    };

    const comingSoon = (e) => {
        e.preventDefault();
        alert('This activity will be available soon!');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {lesson.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {!lesson.is_completed && (
                            <PrimaryButton onClick={handleMarkComplete} disabled={isLoading}>
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {isLoading ? 'Marking...' : 'Mark as Completed'}
                            </PrimaryButton>
                        )}
                        <SecondaryButton onClick={() => router.visit(route('student.lessons.index'))}>
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Lessons
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={lesson.title} />

            <div className="py-4">
                <div className="mx-auto max-w-4xl">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* Lesson Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {lesson.subject}
                                </span>
                                {lesson.is_completed && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        Completed
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    {lesson.teacher}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    {lesson.publish_date}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 break-words">
                                    <BookOpenIcon className="w-6 h-6 text-blue-500 shrink-0" />
                                    {lesson.title}
                                </h3>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                                <div className="text-gray-700 whitespace-pre-wrap break-words">
                                    {lesson.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5 text-blue-500" />
                                    Lesson Content
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="prose prose-blue max-w-none text-gray-700 break-words">
                                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Resources */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                                        Learning Resources
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {lesson.resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-3"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getResourceIcon(resource.type)}
                                                <div>
                                                    <div className="font-medium text-gray-800 break-words">
                                                        {resource.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {getResourceLabel(resource.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isUrlResource(resource.type) ? (
                                                <a
                                                    href={resource.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors shrink-0"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                    Open Link
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownload(resource.id)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shrink-0"
                                                >
                                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                                    Download
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Related Activities */}
                    {(related_activities.assignment || related_activities.quiz || related_activities.game) && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-gray-500" />
                                        Related Activities
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-3">
                                        {related_activities.assignment && (
                                            <a href="#" onClick={comingSoon} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors">
                                                <ClipboardDocumentListIcon className="w-4 h-4" />
                                                Open Assignment: {related_activities.assignment.title}
                                            </a>
                                        )}
                                        {related_activities.quiz && (
                                            <a href="#" onClick={comingSoon} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                                                <ChartBarIcon className="w-4 h-4" />
                                                Take Quiz: {related_activities.quiz.title}
                                            </a>
                                        )}
                                        {related_activities.game && (
                                            <a href="#" onClick={comingSoon} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors">
                                                <PuzzlePieceIcon className="w-4 h-4" />
                                                Play Game: {related_activities.game.title}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Completion Status */}
                    <div className="mt-6">
                        {lesson.is_completed ? (
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                                <div className="flex items-center gap-3 text-emerald-700">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Lesson Completed!</div>
                                        <div className="text-sm text-emerald-600">Great job! You have completed this lesson.</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                                <div className="flex items-center gap-3 text-yellow-700">
                                    <BookOpenIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Not Yet Completed</div>
                                        <div className="text-sm text-yellow-600">Click the "Mark as Completed" button above when you finish this lesson.</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
