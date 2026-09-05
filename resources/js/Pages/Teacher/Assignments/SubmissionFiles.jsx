import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';
import {
    ArrowLeftIcon,
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/outline';

export default function SubmissionFiles({ submission, assignment, student }) {
    const files = submission?.files || [];
    const hasLegacyFile = !files.length && submission?.file_path;
    const isOfficeFile = (file) => /\.(doc|docx|ppt|pptx)$/i.test(file?.name || file?.path || '')
        || /(msword|wordprocessingml|ms-powerpoint|presentationml)/i.test(file?.mime || '');
    const officeApplication = (file) => /\.(ppt|pptx)$/i.test(file?.name || file?.path || '')
        || /(powerpoint|presentationml)/i.test(file?.mime || '') ? 'PowerPoint' : 'Word';
    const fileCategory = (file) => {
        if ((file?.mime || '').startsWith('image/')) return 'Images';
        if ((file?.mime || '').startsWith('video/')) return 'Videos';
        return 'Documents';
    };
    const fileSections = ['Documents', 'Images', 'Videos']
        .map((label) => ({
            label,
            files: files.map((file, index) => ({ file, index })).filter(({ file }) => fileCategory(file) === label),
        }))
        .filter((section) => section.files.length > 0);

    const getIcon = (mime) => {
        if (!mime) return <PaperClipIcon className="w-5 h-5 text-gray-500" />;
        if (mime.startsWith('image/')) return <PhotoIcon className="w-5 h-5 text-emerald-500" />;
        if (mime.startsWith('video/')) return <VideoCameraIcon className="w-5 h-5 text-indigo-500" />;
        if (mime === 'application/pdf') return <DocumentIcon className="w-5 h-5 text-red-500" />;
        return <PaperClipIcon className="w-5 h-5 text-blue-500" />;
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const openFile = (url, action) => {
        const fileWindow = window.open(url, '_blank');
        if (!fileWindow) {
            toast.error(`Your browser blocked the file ${action}. Please allow pop-ups and try again.`);
            return;
        }
        fileWindow.opener = null;
    };

    const viewFile = (file, index) => {
        openFile(route('teacher.assignments.view-file', { submissionId: submission.id, index }), 'viewer');
    };

    const downloadFile = (file, index) => {
        openFile(route('teacher.assignments.download-file', { submissionId: submission.id, index }), 'download');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <span className="assignment-page-clamp text-xl font-semibold leading-tight text-gray-800">
                        {student.name} – Submitted Files
                    </span>
                    <SecondaryButton className="w-full justify-center sm:w-auto" onClick={() => router.visit(route('teacher.assignments.grade', assignment.id), {
                        onError: () => toast.error('Unable to return to grading. Please try again.'),
                    })}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Grading
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={`Files - ${student.name}`} />

            <style>{`
                .assignment-page-clamp {
                    min-width: 0;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .submission-assignment-title {
                    display: inline-block;
                    max-width: 100%;
                    vertical-align: bottom;
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Student & Assignment Info */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">{student.name}</h2>
                        <p className="text-sm text-gray-500">
                            Assignment: <span className="assignment-page-clamp submission-assignment-title font-medium text-gray-700" title={assignment.title}>{assignment.title}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Subject: <span className="font-medium text-gray-700">{assignment.subject}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Submitted: <span className="font-medium text-gray-700">{submission?.submitted_at || 'N/A'}</span>
                        </p>
                    </div>

                    {/* Files List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                            <h3 className="text-sm font-semibold text-gray-700">Files ({files.length + (hasLegacyFile ? 1 : 0)})</h3>
                        </div>
                        <div className="space-y-4 p-4 sm:p-6">
                            {files.length === 0 && !hasLegacyFile ? (
                                <p className="text-gray-500 text-center py-8">No files have been submitted.</p>
                            ) : (
                                <>
                                    {fileSections.map((section) => (
                                        <section key={section.label} className="overflow-hidden rounded-xl border border-gray-200">
                                            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                                                <h4 className="text-sm font-semibold text-gray-700">{section.label}</h4>
                                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">{section.files.length}</span>
                                            </div>
                                            <div className="divide-y divide-gray-200">
                                    {section.files.map(({ file, index: idx }) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                {getIcon(file.mime)}
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-800 break-words">{file.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {file.mime ? file.mime.split('/').pop().toUpperCase() : 'Unknown'} – {formatSize(file.size)}
                                                    </div>
                                                    {isOfficeFile(file) && <p className="mt-1 text-xs text-amber-600">Download to open in Microsoft {officeApplication(file)}.</p>}
                                                </div>
                                            </div>
                                            <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                                                {!isOfficeFile(file) && <button
                                                    onClick={() => viewFile(file, idx)}
                                                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:flex-none sm:py-1.5"
                                                >
                                                    <EyeIcon className="w-4 h-4" /> View
                                                </button>}
                                                <button
                                                    onClick={() => downloadFile(file, idx)}
                                                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:flex-none sm:py-1.5"
                                                >
                                                    <ArrowDownTrayIcon className="w-4 h-4" /> Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                            </div>
                                        </section>
                                    ))}

                                    {/* Legacy single file */}
                                    {hasLegacyFile && (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4">
                                            <div className="flex min-w-0 items-center gap-4">
                                                {getIcon('')}
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-800 break-words">
                                                        {submission.file_name || 'File'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">Legacy upload</div>
                                                    {isOfficeFile({ name: submission.file_name, path: submission.file_path }) && <p className="mt-1 text-xs text-amber-600">Download to open in Microsoft {officeApplication({ name: submission.file_name, path: submission.file_path })}.</p>}
                                                </div>
                                            </div>
                                            <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                                                {!isOfficeFile({ name: submission.file_name, path: submission.file_path }) && <button
                                                    onClick={() => viewFile({}, 0)}
                                                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:flex-none sm:py-1.5"
                                                >
                                                    <EyeIcon className="w-4 h-4" /> View
                                                </button>}
                                                <button
                                                    onClick={() => downloadFile({}, 0)}
                                                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:flex-none sm:py-1.5"
                                                >
                                                    <ArrowDownTrayIcon className="w-4 h-4" /> Download
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
