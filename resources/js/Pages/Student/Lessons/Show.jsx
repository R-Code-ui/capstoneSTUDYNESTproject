import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import LessonResources from '@/Components/LessonResources';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

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
    EyeIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/outline';

export default function LessonsShow({ lesson, related_activities }) {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmingCompletion, setConfirmingCompletion] = useState(false);
    const [selectingResources, setSelectingResources] = useState(false);
    const hasDownloadableResources = lesson.resources?.some((resource) => resource.type !== 'url');

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf_module': return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-emerald-500" />;
            case 'worksheet': return <PaperClipIcon className="w-6 h-6 text-blue-500" />;
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

    const isUrlResource = (type) => type === 'url';
    const handleMarkComplete = () => setConfirmingCompletion(true);

    const completeLesson = () => {
        setConfirmingCompletion(false);
        setIsLoading(true);
        router.post(route('student.lessons.complete', lesson.id), {}, {
            preserveState: true,
            onSuccess: () => toast.success('Lesson marked as completed.'),
            onError: () => toast.error('Unable to mark this lesson as completed. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const openResource = (url, action) => {
        // `noopener` makes some browsers return null even after opening the tab.
        // Open first so a null result reliably indicates an actually blocked pop-up.
        const resourceWindow = window.open(url, '_blank');
        if (!resourceWindow) {
            toast.error(`Your browser blocked the resource ${action}. Please allow pop-ups and try again.`);
            return;
        }
        // Keep the opened resource isolated from this page.
        resourceWindow.opener = null;
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

        window.setTimeout(() => {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }, 150);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                        <Link
                            href={route('student.lessons.index')}
                            onError={() => toast.error('Unable to return to lessons. Please try again.')}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                            aria-label="Back to Lessons"
                            title="Back to Lessons"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Link>
                        <span className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-gray-800" title={lesson.title}>
                            {lesson.title}
                        </span>
                    </div>
                    {!lesson.is_completed && (
                        <PrimaryButton className="hidden shrink-0 xl:inline-flex" onClick={handleMarkComplete} disabled={isLoading}>
                            <CheckCircleIcon className="mr-1 h-4 w-4" />
                            {isLoading ? 'Marking...' : 'Mark as Completed'}
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title={lesson.title} />

            <div onFocusCapture={keepFocusedFieldVisible} className="student-lesson-show-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6">
                <style>{`
                    .student-lesson-show-page input,
                    .student-lesson-show-page select,
                    .student-lesson-show-page textarea {
                        scroll-margin-block: 7rem;
                    }

                    @media (max-width: 639px) {
                        .student-lesson-show-page input:not([type="checkbox"]),
                        .student-lesson-show-page select,
                        .student-lesson-show-page textarea {
                            font-size: 16px;
                        }
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .bg-white {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(51 65 85) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .bg-gray-50 {
                        background-color: rgb(30 41 59) !important;
                        border-color: rgb(71 85 105) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .bg-yellow-50 {
                        background-color: rgb(51 42 20) !important;
                        border-color: rgb(146 105 28) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .text-gray-800,
                    .studynest-layout.theme-dark .student-lesson-show-page .text-gray-700 {
                        color: rgb(226 232 240) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .text-gray-600,
                    .studynest-layout.theme-dark .student-lesson-show-page .text-gray-500 {
                        color: rgb(148 163 184) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .text-yellow-700 {
                        color: rgb(253 224 71) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page .text-yellow-600 {
                        color: rgb(250 204 21) !important;
                    }

                    .studynest-layout.theme-dark .student-lesson-show-page [class~="border-gray-200"],
                    .studynest-layout.theme-dark .student-lesson-show-page [class~="border-gray-100"] {
                        border-color: rgb(51 65 85) !important;
                    }

                    .student-lesson-show-page .prose,
                    .student-lesson-show-page .prose * {
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }

                    @media (max-width: 640px) {
                        .student-lesson-show-page .p-6 {
                            padding: 1rem;
                        }
                    }
                `}</style>
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* Lesson Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="space-y-4 p-4 sm:p-6">
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

                            <div className="xl:hidden">
                                <h3 className="flex min-w-0 max-w-full items-start gap-2 break-words text-2xl font-bold text-gray-800" title={lesson.title}>
                                    <BookOpenIcon className="w-6 h-6 text-blue-500 shrink-0" />
                                    {lesson.title}
                                </h3>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                                <div className="text-gray-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                    {lesson.description}
                                </div>
                            </div>

                            {!lesson.is_completed && (
                                <PrimaryButton className="w-full justify-center xl:hidden" onClick={handleMarkComplete} disabled={isLoading}>
                                    <CheckCircleIcon className="mr-1 h-4 w-4" />
                                    {isLoading ? 'Marking...' : 'Mark as Completed'}
                                </PrimaryButton>
                            )}
                        </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5 text-blue-500" />
                                    Lesson Content
                                </h3>
                            </div>
                            <div className="p-4 sm:p-6">
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
                                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <PaperClipIcon className="h-5 w-5 text-blue-500" />
                                        Learning Resources
                                    </h3>
                                    {hasDownloadableResources && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectingResources((current) => !current)}
                                            className={`inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition-colors sm:w-auto ${selectingResources ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            {selectingResources ? 'Cancel selection' : 'Select files'}
                                        </button>
                                    )}
                                </div>
                                <div className="p-3 sm:p-6"><LessonResources resources={lesson.resources} viewUrl={(id) => route('student.lessons.view-resource', id)} downloadUrl={(id) => route('student.lessons.download-resource', id)} onView={(url) => openResource(url, 'viewer')} onDownload={(url) => openResource(url, 'download')} selectionMode={selectingResources} onExitSelection={() => setSelectingResources(false)} /></div>
                            </div>
                        </div>
                    )}

                    {/* Related Activities */}
                    {(related_activities.assignment || related_activities.quiz || related_activities.game) && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-gray-500" />
                                        Related Activities
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-wrap gap-3">
                                        {related_activities.assignment && (
                                            <Link href={route('student.assignments.show', related_activities.assignment.id)} onError={() => toast.error('Unable to open the related assignment. Please try again.')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-amber-700 sm:w-auto">
                                                <ClipboardDocumentListIcon className="w-4 h-4" />
                                                Open Assignment: {related_activities.assignment.title}
                                            </Link>
                                        )}
                                        {related_activities.quiz && (
                                            <Link href={route('student.quizzes.show', related_activities.quiz.id)} onError={() => toast.error('Unable to open the related quiz. Please try again.')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700 sm:w-auto">
                                                <ChartBarIcon className="w-4 h-4" />
                                                Take Quiz: {related_activities.quiz.title}
                                            </Link>
                                        )}
                                        {related_activities.game && (
                                            <Link href={route('student.games.show', related_activities.game.id)} onError={() => toast.error('Unable to open the related game. Please try again.')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:w-auto">
                                                <PuzzlePieceIcon className="w-4 h-4" />
                                                Play Game: {related_activities.game.title}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Completion Status */}
                    <div className="mt-6">
                        {lesson.is_completed ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
                                <div className="flex items-center gap-3 text-emerald-700">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Lesson Completed!</div>
                                        <div className="text-sm text-emerald-600">Great job! You have completed this lesson.</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:p-6">
                                <div className="flex items-center gap-3 text-yellow-700">
                                    <BookOpenIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Not Yet Completed</div>
                                        <div className="text-sm text-yellow-600 break-words">Click the "Mark as Completed" button above when you finish this lesson.</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmModal
                show={confirmingCompletion}
                onClose={() => setConfirmingCompletion(false)}
                onConfirm={completeLesson}
                title="Mark lesson as completed?"
                message="Mark this lesson as completed? You can review the lesson again at any time."
                confirmText="Mark completed"
                cancelText="Cancel"
                confirmColor="green"
            />
        </AuthenticatedLayout>
    );
}
