import MessageGroupForm from '@/Components/MessageGroupForm';

export default function Edit({ group, students, assigned_grades, selected_grade_levels }) {
    return (
        <MessageGroupForm
            group={group}
            students={students}
            assignedGrades={assigned_grades}
            selectedGradeLevels={selected_grade_levels}
        />
    );
}
