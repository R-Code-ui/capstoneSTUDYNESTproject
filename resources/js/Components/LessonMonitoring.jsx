import Table, { StatusBadge } from '@/Components/Table';

export default function LessonMonitoring({ lessons }) {
    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'grade', label: 'Grade' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'created_at', label: 'Date Published' },
    ];

    return (
        <Table
            columns={columns}
            rows={lessons}
            emptyMessage="No lessons found."
            hoverable
            striped
        />
    );
}
