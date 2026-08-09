import MessageGroupConversation from '@/Components/MessageGroupConversation';

export default function Show({ group, can_manage }) {
    return <MessageGroupConversation group={group} isTeacher canManage={can_manage} />;
}
