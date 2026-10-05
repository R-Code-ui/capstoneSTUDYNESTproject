import Table from '@/Components/Table';
import StatusBadge from '@/Components/StatusBadge';

export default function AssignmentMonitoring({ assignments, pagination }) {
    const columns = [
        {
            key: 'title',
            label: 'Title',
            render: (row) => <span className="block max-w-[240px] truncate" title={row.title || ''}>{row.title || '—'}</span>,
        },
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
            responsive
            pagination={pagination}
        />
    );
}
