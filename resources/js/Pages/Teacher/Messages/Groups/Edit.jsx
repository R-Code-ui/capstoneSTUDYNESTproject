import MessageGroupForm from '@/Components/MessageGroupForm';

export default function Edit({ group, students, subjects }) {
    return <MessageGroupForm group={group} students={students} subjects={subjects} />;
}
