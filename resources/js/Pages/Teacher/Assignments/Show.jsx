import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function AssignmentsShow({ assignment }) {
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

    const getStatusColor = (status) => {
        const colors = {
            not_submitted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            late_submission: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            reviewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            graded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            returned_for_revision: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return colors[status] || colors.not_submitted;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {assignment.assignment_title}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('teacher.assignments.grade', assignment.id)}>
                            <SecondaryButton>📋 Grade</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.assignments.edit', assignment.id)}>
                            <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.assignments.index')}>
                            <PrimaryButton>Back to List</PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={assignment.assignment_title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Grade Level</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.grade_level}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Subject</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.subject}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <StatusBadge status={assignment.status} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Points</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.total_points}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Due Date</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.due_date}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Due Time</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.due_time}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Allow Late Submission</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.allow_late_submission ? 'Yes' : 'No'}</div>
                            </div>
                            {assignment.estimated_time && (
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Time</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{assignment.estimated_time} minutes</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Publish Date</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.publish_date}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Created At</div>
                                <div className="font-medium text-gray-900 dark:text-white">{assignment.created_at}</div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Instructions ===== */}
                    <div className="mt-6">
                        <Card title="Instructions">
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {assignment.instructions}
                            </div>
                        </Card>
                    </div>

                    {/* ===== Submission Methods ===== */}
                    <div className="mt-6">
                        <Card title="Submission Methods">
                            <div className="flex flex-wrap gap-2">
                                {assignment.submission_methods?.map((method) => (
                                    <span
                                        key={method}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    >
                                        {method.charAt(0).toUpperCase() + method.slice(1)} Upload
                                    </span>
                                ))}
                                {(!assignment.submission_methods || assignment.submission_methods.length === 0) && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">No submission methods specified</span>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* ===== Learning Resources ===== */}
                    {assignment.resources && assignment.resources.length > 0 && (
                        <div className="mt-6">
                            <Card title="Learning Resources">
                                <div className="space-y-3">
                                    {assignment.resources.map((resource) => (
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
                                                        {getResourceLabel(resource.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href={route('teacher.assignments.download-resource', resource.id)}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
