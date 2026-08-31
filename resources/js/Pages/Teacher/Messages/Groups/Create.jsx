import MessageGroupForm from '@/Components/MessageGroupForm';

export default function Create({ students, assigned_grades, selected_grade_levels }) {
    return (
        <MessageGroupForm
            students={students}
            assignedGrades={assigned_grades}
            selectedGradeLevels={selected_grade_levels}
        />
    );
}
