import Table, { StatusBadge } from '@/Components/Table';

export default function QuizMonitoring({ quizzes }) {
    const getTypeLabel = (type) => {
        const labels = {
            multiple_choice: 'Multiple Choice',
            identification: 'Identification',
            true_false: 'True or False',
        };
        return labels[type] || type;
    };

    const columns = [
        { key: 'title', label: 'Title' },
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
        />
    );
}
