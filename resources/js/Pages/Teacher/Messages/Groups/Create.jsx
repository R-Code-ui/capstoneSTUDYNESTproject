import MessageGroupForm from '@/Components/MessageGroupForm';

export default function Create({ students, subjects, grade_level }) {
    return <MessageGroupForm students={students} subjects={subjects} grade_level={grade_level} />;
}
