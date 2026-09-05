import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StudentResources from '@/Components/StudentResources';
import useDeadlineStatuses from '@/Hooks/useDeadlineStatuses';
import { toast } from 'sonner';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentsShow({ assignment }) {
    const getDeadlineStatus = useDeadlineStatuses(assignment);
    const deadlineStatus = getDeadlineStatus(assignment);
    const handleNavigationError = () => toast.error('Unable to load that page. Please try again.');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                        <Link
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                            href={route('teacher.assignments.index')}
                            onError={handleNavigationError}
                            aria-label="Back to Assignments"
                            title="Back to Assignments"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Link>
                        <span className="assignment-show-title min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-800" title={assignment.assignment_title}>
                            {assignment.assignment_title}
                        </span>
                    </div>
                    <div className="flex w-full flex-row flex-wrap justify-end gap-2 xl:ml-auto xl:w-auto xl:shrink-0">
                        <Link className="w-auto" href={route('teacher.assignments.grade', assignment.id)} onError={handleNavigationError}>
                            <SecondaryButton className="min-h-11 w-auto justify-center">
                                <ClipboardDocumentListIcon className="mr-1 h-4 w-4" />
                                Grade Submissions
                            </SecondaryButton>
                        </Link>
                        <Link className="w-auto" href={route('teacher.assignments.edit', assignment.id)} onError={handleNavigationError}>
                            <PrimaryButton className="min-h-11 w-auto justify-center">
                                <PencilSquareIcon className="mr-1 h-4 w-4" />
                                Edit Assignment
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={assignment.assignment_title} />

            <style>{`
                .assignment-show-title {
                    display: block;
                    min-width: 0;
                    max-width: min(100%, 48rem);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .assignment-readable-text {
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
                                    <div className="font-medium text-gray-800">{assignment.grade_level}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</div>
                                    <div className="font-medium text-gray-800">{assignment.subject}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</div>
                                    <div className="font-medium text-gray-800">
                                        {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={assignment.status} />
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Points</div>
                                    <div className="font-medium text-gray-800">{assignment.total_points}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</div>
                                    <div className="font-medium text-gray-800">{assignment.due_date}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due Time</div>
                                    <div className="font-medium text-gray-800">{assignment.due_time}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Allow Late Submission</div>
                                    <div className="font-medium text-gray-800">{assignment.allow_late_submission ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deadline</div>
                                    <StatusBadge status={deadlineStatus} size="sm" />
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{assignment.publish_date}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</div>
                                    <div className="font-medium text-gray-800">{assignment.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {deadlineStatus !== 'open' && (
                        <div className={`mt-6 rounded-xl border p-4 ${deadlineStatus === 'expired' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
                            <div className="font-semibold">{deadlineStatus === 'expired' ? 'Assignment expired' : 'Late submissions are allowed'}</div>
                            <p className="mt-1 text-sm">The deadline was {assignment.due_at_label}. Existing submissions remain available for grading.</p>
                        </div>
                    )}

                    {/* ===== Instructions ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Instructions</h3>
                            </div>
                            <div className="p-6">
                                <div className="assignment-readable-text text-gray-700 whitespace-pre-wrap" title={assignment.instructions}>
                                    {assignment.instructions}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Submission Methods ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Submission Methods</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2">
                                    {assignment.submission_methods?.map((method) => (
                                        <span
                                            key={method}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                        >
                                            {method.charAt(0).toUpperCase() + method.slice(1)} Upload
                                        </span>
                                    ))}
                                    {(!assignment.submission_methods || assignment.submission_methods.length === 0) && (
                                        <span className="text-sm text-gray-500">No submission methods specified</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Learning Resources ===== */}
                    {assignment.resources && assignment.resources.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Learning Resources</h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <StudentResources
                                        resources={assignment.resources}
                                        viewUrl={(id) => route('teacher.assignments.view-resource', id)}
                                        downloadUrl={(id) => route('teacher.assignments.download-resource', id)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
