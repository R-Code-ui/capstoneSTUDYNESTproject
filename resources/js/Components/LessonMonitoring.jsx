import Table, { StatusBadge } from '@/Components/Table';

export default function LessonMonitoring({ lessons, pagination }) {
    const columns = [
        {
            key: 'title',
            label: 'Title',
            render: (row) => <span className="block max-w-[240px] truncate" title={row.title || ''}>{row.title || '—'}</span>,
        },
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
            responsive
            pagination={pagination}
        />
    );
}
