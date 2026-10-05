import Table from '@/Components/Table';

export default function QuizMonitoring({ quizzes, pagination }) {
    const getTypeLabel = (type) => {
        const labels = {
            multiple_choice: 'Multiple Choice',
            identification: 'Identification',
            true_false: 'True or False',
        };
        return labels[type] || type;
    };

    const columns = [
        {
            key: 'title',
            label: 'Title',
            render: (row) => <span className="block max-w-[240px] truncate" title={row.title || ''}>{row.title || '—'}</span>,
        },
        { key: 'grade', label: 'Grade' },
        { key: 'type', label: 'Type', render: (row) => getTypeLabel(row.type) },
        { key: 'attempts', label: 'Attempts' },
    ];

    return (
        <Table
            columns={columns}
            rows={quizzes}
            emptyMessage="No quizzes found."
            hoverable
            striped
            responsive
            pagination={pagination}
        />
    );
}
