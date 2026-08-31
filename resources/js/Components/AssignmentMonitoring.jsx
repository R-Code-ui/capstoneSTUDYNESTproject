import Table from '@/Components/Table';
import StatusBadge from '@/Components/StatusBadge';

export default function AssignmentMonitoring({ assignments, pagination }) {
    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'grade', label: 'Grade' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'deadline_status', label: 'Deadline', render: (row) => <StatusBadge status={row.deadline_status} size="sm" /> },
        { key: 'submissions', label: 'Submissions' },
    ];

    return (
        <Table
            columns={columns}
            rows={assignments}
            emptyMessage="No assignments found."
            hoverable
            striped
            pagination={pagination}
        />
    );
}
