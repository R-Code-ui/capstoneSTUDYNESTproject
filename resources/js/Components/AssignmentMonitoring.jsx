import Table, { StatusBadge } from '@/Components/Table';

export default function AssignmentMonitoring({ assignments }) {
    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'grade', label: 'Grade' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'submissions', label: 'Submissions' },
    ];

    return (
        <Table
            columns={columns}
            rows={assignments}
            emptyMessage="No assignments found."
            hoverable
            striped
        />
    );
}
