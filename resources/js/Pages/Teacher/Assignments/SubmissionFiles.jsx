import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
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

    const viewFile = (file, index) => {
        window.open(
            route('teacher.assignments.view-file', { submissionId: submission.id, index }),
            '_blank'
        );
    };

    const downloadFile = (file, index) => {
        window.open(
            route('teacher.assignments.download-file', { submissionId: submission.id, index }),
            '_blank'
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {student.name} – Submitted Files
                    </span>
                    <SecondaryButton onClick={() => router.visit(route('teacher.assignments.grade', assignment.id))}>
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

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Student & Assignment Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
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
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Files ({files.length + (hasLegacyFile ? 1 : 0)})</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {files.length === 0 && !hasLegacyFile ? (
                                <p className="text-gray-500 text-center py-8">No files have been submitted.</p>
                            ) : (
                                <>
                                    {files.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getIcon(file.mime)}
                                                <div>
                                                    <div className="font-medium text-gray-800 break-words">{file.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {file.mime ? file.mime.split('/').pop().toUpperCase() : 'Unknown'} – {formatSize(file.size)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => viewFile(file, idx)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <EyeIcon className="w-4 h-4" /> View
                                                </button>
                                                <button
                                                    onClick={() => downloadFile(file, idx)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                                                >
                                                    <ArrowDownTrayIcon className="w-4 h-4" /> Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Legacy single file */}
                                    {hasLegacyFile && (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4">
                                            <div className="flex items-center gap-4">
                                                {getIcon('')}
                                                <div>
                                                    <div className="font-medium text-gray-800 break-words">
                                                        {submission.file_name || 'File'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">Legacy upload</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => viewFile({}, 0)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <EyeIcon className="w-4 h-4" /> View
                                                </button>
                                                <button
                                                    onClick={() => downloadFile({}, 0)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
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
