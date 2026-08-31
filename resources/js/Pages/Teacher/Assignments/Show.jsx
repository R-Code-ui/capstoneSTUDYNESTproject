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
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="assignment-show-title text-xl font-semibold leading-tight text-gray-800" title={assignment.assignment_title}>
                        {assignment.assignment_title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('teacher.assignments.grade', assignment.id)} onError={handleNavigationError}>
                            <SecondaryButton>
                                <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                                Grade
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.assignments.edit', assignment.id)} onError={handleNavigationError}>
                            <SecondaryButton>
                                <PencilSquareIcon className="w-4 h-4 mr-1" />
                                Edit
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.assignments.index')} onError={handleNavigationError}>
                            <PrimaryButton>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to List
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

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{assignment.grade_level}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</div>
                                    <div className="font-medium text-gray-800">{assignment.subject}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</div>
                                    <div className="font-medium text-gray-800">
                                        {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={assignment.status} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Points</div>
                                    <div className="font-medium text-gray-800">{assignment.total_points}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</div>
                                    <div className="font-medium text-gray-800">{assignment.due_date}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due Time</div>
                                    <div className="font-medium text-gray-800">{assignment.due_time}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Allow Late Submission</div>
                                    <div className="font-medium text-gray-800">{assignment.allow_late_submission ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deadline</div>
                                    <StatusBadge status={deadlineStatus} size="sm" />
                                </div>
                                {assignment.estimated_time && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Estimated Time</div>
                                        <div className="font-medium text-gray-800">{assignment.estimated_time} minutes</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{assignment.publish_date}</div>
                                </div>
                                <div>
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
