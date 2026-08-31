import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';

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

export default function LessonsShow({ lesson, completion_records = [], student_completion = [] }) {
    const [completionFilter, setCompletionFilter] = useState('all');
    const [completionPage, setCompletionPage] = useState(1);
    const completionPageSize = 10;
    const completedStudents = student_completion.filter((student) => student.status === 'completed');
    const incompleteStudents = student_completion.filter((student) => student.status === 'not_completed');
    const filteredStudents = completionFilter === 'completed'
        ? completedStudents
        : completionFilter === 'not_completed'
            ? incompleteStudents
            : student_completion;
    const completionPageCount = Math.max(1, Math.ceil(filteredStudents.length / completionPageSize));
    const paginatedStudents = filteredStudents.slice((completionPage - 1) * completionPageSize, completionPage * completionPageSize);
    const completionStart = filteredStudents.length === 0 ? 0 : (completionPage - 1) * completionPageSize + 1;
    const completionEnd = Math.min(completionPage * completionPageSize, filteredStudents.length);

    useEffect(() => {
        setCompletionPage(1);
    }, [completionFilter]);
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
    const isOfficeDocument = (resource) => /\.(doc|docx|ppt|pptx)$/i.test(resource.name || resource.path || '')
        || /(msword|wordprocessingml|ms-powerpoint|presentationml)/i.test(resource.mime || '');
    const officeApplication = (resource) => /\.(ppt|pptx)$/i.test(resource.name || resource.path || '')
        || /(powerpoint|presentationml)/i.test(resource.mime || '') ? 'PowerPoint' : 'Word';

    const handleView = (resourceId) => {
        const resourceWindow = window.open(route('teacher.lessons.view-resource', resourceId), '_blank');
        if (!resourceWindow) {
            toast.error('Your browser blocked the resource viewer. Please allow pop-ups and try again.');
            return;
        }
        resourceWindow.opener = null;
    };

    const handleDownload = (resourceId) => {
        const downloadWindow = window.open(route('teacher.lessons.download-resource', resourceId), '_blank');
        if (!downloadWindow) {
            toast.error('Your browser blocked the resource download. Please allow pop-ups and try again.');
            return;
        }
        downloadWindow.opener = null;
    };

    const handleNavigationError = () => toast.error('Unable to load that page. Please try again.');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="lesson-show-title text-xl font-semibold leading-tight text-gray-800" title={lesson.lesson_title}>
                        {lesson.lesson_title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('teacher.lessons.edit', lesson.id)} onError={handleNavigationError}>
                            <SecondaryButton>
                                <PencilSquareIcon className="w-4 h-4 mr-1" />
                                Edit
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.lessons.index')} onError={handleNavigationError}>
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
            <style>{`
                .lesson-readable-text {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 3;
                    overflow: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    text-overflow: ellipsis;
                }
                .lesson-show-title {
                    display: block;
                    max-width: min(100%, 48rem);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .studynest-layout.theme-dark .lesson-show-page .text-gray-700,
                .studynest-layout.theme-dark .lesson-show-page .text-gray-800 {
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .lesson-show-page .text-gray-500,
                .studynest-layout.theme-dark .lesson-show-page .text-gray-600 {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .lesson-show-page .prose {
                    color: rgb(203 213 225) !important;
                    max-width: 100%;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .completion-filter {
                    background-color: white;
                    color: rgb(31 41 55);
                }
                .studynest-layout.theme-dark .lesson-show-page .completion-filter {
                    background-color: rgb(30 41 59) !important;
                    border-color: rgb(71 85 105) !important;
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .lesson-show-page .completion-filter option {
                    background-color: rgb(15 23 42);
                    color: rgb(226 232 240);
                }
            `}</style>
            <div className="lesson-show-page py-12">
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
                                    <div className="lesson-readable-text text-gray-800">{lesson.learning_competency}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Learning Objective</div>
                                    <div className="lesson-readable-text text-gray-800">{lesson.learning_objective}</div>
                                </div>
                                {lesson.bow_code && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">BOW Code</div>
                                        <div className="lesson-readable-text text-gray-800 font-mono">{lesson.bow_code}</div>
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
                                <div className="lesson-readable-text text-gray-700 whitespace-pre-wrap">{lesson.lesson_description}</div>
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
                                    <div className="lesson-readable-text" dangerouslySetInnerHTML={{ __html: lesson.lesson_content }} />
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
                                    <div className="lesson-readable-text text-gray-700 whitespace-pre-wrap">{lesson.key_takeaways}</div>
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
                                                    {isOfficeDocument(resource) && (
                                                        <div className="text-sm text-gray-500">Download to open in Microsoft {officeApplication(resource)}.</div>
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
                                                        {!isOfficeDocument(resource) && <button onClick={() => handleView(resource.id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                                                            <EyeIcon className="w-4 h-4" /> View
                                                        </button>}
                                                        <button type="button" onClick={() => handleDownload(resource.id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                                            <ArrowDownTrayIcon className="w-4 h-4" /> Download
                                                        </button>
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
                        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="text-sm font-semibold text-gray-700">Student Completion ({completedStudents.length}/{student_completion.length})</h3>
                            <select value={completionFilter} onChange={(event) => setCompletionFilter(event.target.value)} className="completion-filter rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="all">All Students</option>
                                <option value="completed">Completed</option>
                                <option value="not_completed">Not Completed</option>
                            </select>
                        </div>
                        <div className="p-6">
                            {filteredStudents.length === 0 ? (
                                <p className="text-sm text-gray-500">No students match this filter.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead><tr className="border-b text-left text-gray-500"><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Grade Level</th><th className="py-2 pr-4">Status</th><th className="py-2">Completed At</th></tr></thead>
                                        <tbody>{paginatedStudents.map((student) => <tr key={student.id} className="border-b last:border-0"><td className="py-3 pr-4 font-medium text-gray-800">{student.name}</td><td className="py-3 pr-4 text-gray-600">{student.grade_level}</td><td className={`py-3 pr-4 ${student.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{student.status === 'completed' ? 'Completed' : 'Not completed'}</td><td className="py-3 text-gray-600">{student.completed_at || '—'}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        {filteredStudents.length > 0 && (
                            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-800">{completionStart}</span> to <span className="font-semibold text-gray-800">{completionEnd}</span> of <span className="font-semibold text-gray-800">{filteredStudents.length}</span> results</p>
                                <nav aria-label="Student completion pagination" className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-800/60">
                                    <button type="button" onClick={() => setCompletionPage((page) => Math.max(1, page - 1))} disabled={completionPage === 1} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700">Previous</button>
                                    {Array.from({ length: completionPageCount }, (_, index) => index + 1).map((page) => <button key={page} type="button" onClick={() => setCompletionPage(page)} aria-current={page === completionPage ? 'page' : undefined} className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${page === completionPage ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'}`}>{page}</button>)}
                                    <button type="button" onClick={() => setCompletionPage((page) => Math.min(completionPageCount, page + 1))} disabled={completionPage === completionPageCount} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700">Next</button>
                                </nav>
                            </div>
                        )}
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
                                                onError={handleNavigationError}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
                                            >
                                                <DocumentTextIcon className="w-4 h-4" />
                                                Open Assignment
                                            </Link>
                                        )}
                                        {lesson.related_quiz_id && (
                                            <Link
                                                href={route('teacher.quizzes.show', lesson.related_quiz_id)}
                                                onError={handleNavigationError}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                            >
                                                <ChartBarIcon className="w-4 h-4" />
                                                Take Quiz
                                            </Link>
                                        )}
                                        {lesson.related_game_id && (
                                            <Link
                                                href={route('teacher.games.show', lesson.related_game_id)}
                                                onError={handleNavigationError}
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
