import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';
import { ArrowLeftIcon, ArchiveBoxIcon, PencilSquareIcon, PaperAirplaneIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function MessageGroupConversation({ group, isTeacher = false, canManage = false }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const bottomRef = useRef(null);
    const { data, setData, errors, post, reset } = useForm({ body: '' });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [group.messages.length]);

    const routePrefix = isTeacher ? 'teacher' : 'student';
    const send = (event) => {
        event.preventDefault();
        if (!data.body.trim()) {
            toast.error('Message content is required.');
            return;
        }
        if (group.is_archived) return;
        setIsSubmitting(true);
        post(route(`${routePrefix}.messages.groups.send`, group.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                toast.success('Message sent successfully.');
            },
            onError: () => toast.error('Unable to send the message. Please check the highlighted fields.'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const confirmAction = () => {
        if (!confirmation) return;

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                const messages = {
                    archive: 'Group archived successfully.',
                    restore: 'Group restored successfully.',
                    deleteGroup: 'Group deleted successfully.',
                    deleteMessage: 'Message removed successfully.',
                    removeMember: 'Member removed successfully.',
                };
                toast.success(messages[confirmation.action]);
                setConfirmation(null);
            },
            onError: () => toast.error('Unable to complete this action. Please try again.'),
        };

        if (confirmation.action === 'archive') {
            router.post(route('teacher.messages.groups.archive', group.id), {}, options);
        } else if (confirmation.action === 'restore') {
            router.post(route('teacher.messages.groups.restore', group.id), {}, options);
        } else if (confirmation.action === 'deleteGroup') {
            router.delete(route('teacher.messages.groups.destroy', group.id), options);
        } else if (confirmation.action === 'deleteMessage') {
            router.delete(route(`${routePrefix}.messages.groups.messages.destroy`, [group.id, confirmation.messageId]), options);
        } else if (confirmation.action === 'removeMember') {
            router.delete(route('teacher.messages.groups.members.remove', [group.id, confirmation.member.id]), options);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <SecondaryButton onClick={() => router.visit(route(`${routePrefix}.messages.index`))}><ArrowLeftIcon className="h-4 w-4" /></SecondaryButton>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-semibold text-slate-800">{group.name}</h1>
                            <p className="text-xs text-slate-500">{group.members.length} members{group.subject ? ` · ${group.subject.name}` : ''}</p>
                        </div>
                    </div>
                    {canManage && (
                        <div className="flex gap-2">
                            <SecondaryButton onClick={() => router.visit(route('teacher.messages.groups.edit', group.id))}><PencilSquareIcon className="h-4 w-4" /></SecondaryButton>
                            {group.is_archived ? <SecondaryButton onClick={() => setConfirmation({ action: 'restore' })}>Restore</SecondaryButton> : <SecondaryButton onClick={() => setConfirmation({ action: 'archive' })}><ArchiveBoxIcon className="mr-1 h-4 w-4" />Archive</SecondaryButton>}
                            {group.is_archived && <button onClick={() => setConfirmation({ action: 'deleteGroup' })} className="rounded-md p-2 text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>}
                        </div>
                    )}
                </div>
            }
        >
            <Head title={group.name} />
            <div className="teacher-group-conversation mx-auto grid max-w-5xl gap-6 px-4 pb-6 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
                <style>{`
                    .teacher-group-conversation .group-message-body {
                        overflow-wrap: anywhere;
                        word-break: break-word;
                        min-width: 0;
                    }
                    .teacher-group-conversation .group-message-input {
                        overflow-wrap: anywhere;
                    }
                    .studynest-layout.theme-dark .teacher-group-conversation .group-conversation-panel,
                    .studynest-layout.theme-dark .teacher-group-conversation .group-members-panel {
                        background: #0f172a !important;
                        border-color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .teacher-group-conversation .group-message-input {
                        background: #1e293b !important;
                        border-color: #475569 !important;
                        color: #e2e8f0 !important;
                    }
                    .studynest-layout.theme-dark .teacher-group-conversation .group-message-input::placeholder {
                        color: #94a3b8 !important;
                    }
                    .studynest-layout.theme-dark .teacher-group-conversation .group-message-bubble.is-owner {
                        background: #1e3a5f !important;
                        color: #dbeafe !important;
                    }
                    .studynest-layout.theme-dark .teacher-group-conversation .group-message-bubble.is-member {
                        background: #334155 !important;
                        color: #e2e8f0 !important;
                    }
                    .group-message-delete { color: rgb(148 163 184); }
                    .group-message-delete:hover,
                    .group-message-delete:focus-visible { color: rgb(220 38 38); }
                    .studynest-layout.theme-dark .group-message-delete { color: rgb(148 163 184); }
                    .studynest-layout.theme-dark .group-message-delete:hover,
                    .studynest-layout.theme-dark .group-message-delete:focus-visible { color: rgb(248 113 113); }
                    @media (max-width: 640px) {
                        .teacher-group-conversation { gap: 1rem; }
                        .teacher-group-conversation .group-conversation-panel,
                        .teacher-group-conversation .group-members-panel { border-radius: 0.75rem; }
                        .teacher-group-conversation .group-message-bubble { max-width: 100%; }
                        .teacher-group-conversation .group-message-input { min-width: 0; }
                    }
                `}</style>
                <div className="group-conversation-panel overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {group.is_archived && <div className="bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">This group has been archived. New messages are disabled.</div>}
                    {group.description && <p className="border-b border-slate-100 px-5 py-4 text-sm text-slate-600">{group.description}</p>}
                    <div className="max-h-[55vh] min-h-[320px] space-y-4 overflow-y-auto p-5">
                        {group.messages.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No messages yet.</p> : group.messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender_id === group.owner_id ? 'justify-start' : 'justify-end'}`}>
                                <div className={`group-message-bubble ${message.sender_id === group.owner_id ? 'is-owner bg-blue-50 text-blue-950' : 'is-member bg-slate-100 text-slate-800'} max-w-[85%] min-w-0 rounded-2xl px-4 py-3`}>
                                    <div className="mb-1 flex items-center gap-2">
                                        <p className="min-w-0 break-words text-xs font-bold text-slate-500">{message.sender_name}{message.sender_id === group.owner_id ? ' · Teacher' : ''}</p>
                                        {message.can_delete && (
                                            <button type="button" onClick={() => setConfirmation({ action: 'deleteMessage', messageId: message.id })} className="group-message-delete shrink-0 rounded transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1" title="Delete message" aria-label="Delete message">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="group-message-body whitespace-pre-wrap text-sm">{message.body}</p>
                                    <p className="mt-2 text-[11px] text-slate-400">{message.created_at}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    <form onSubmit={send} className="border-t border-slate-200 p-4">
                        <div className="flex items-end gap-2">
                            <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} disabled={group.is_archived} rows={2} placeholder={group.is_archived ? 'Group archived' : 'Write a message...'} className="group-message-input flex-1 resize-none rounded-md border-gray-300 text-sm shadow-sm" />
                            <PrimaryButton disabled={isSubmitting || group.is_archived || !data.body.trim()}><PaperAirplaneIcon className="h-4 w-4" /></PrimaryButton>
                        </div>
                        <InputError message={errors.body} className="mt-1" />
                    </form>
                </div>

                <aside className="group-members-panel h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 font-semibold text-slate-800"><UserGroupIcon className="h-5 w-5" /> Members</h2>
                    <div className="mt-4 space-y-3">
                        {group.members.map((member) => <div key={member.id} className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-700">{member.name}</p><p className="text-xs text-slate-400">{member.is_owner ? 'Group owner' : member.grade_level}</p></div>{canManage && !member.is_owner && <button title="Remove member" onClick={() => setConfirmation({ action: 'removeMember', member })} className="text-xs text-red-500 hover:text-red-700">Remove</button>}</div>)}
                    </div>
                </aside>
            </div>
            <ConfirmModal
                show={Boolean(confirmation)}
                onClose={() => setConfirmation(null)}
                onConfirm={confirmAction}
                title={{
                    archive: 'Archive group?',
                    restore: 'Restore group?',
                    deleteGroup: 'Delete group permanently?',
                    deleteMessage: 'Remove message?',
                    removeMember: 'Remove member?',
                }[confirmation?.action] || 'Confirm action'}
                message={{
                    archive: 'Archive this group? Members will still see existing messages but cannot send new ones.',
                    restore: 'Restore this group? Members will be able to send new messages again.',
                    deleteGroup: 'Delete this archived group and all of its messages? This action cannot be undone.',
                    deleteMessage: 'Remove this message from your messages? Other group members will still see it.',
                    removeMember: `Remove ${confirmation?.member?.name || 'this member'} from this group?`,
                }[confirmation?.action] || ''}
                confirmText={{
                    archive: 'Archive',
                    restore: 'Restore',
                    deleteGroup: 'Delete permanently',
                    deleteMessage: 'Remove',
                    removeMember: 'Remove member',
                }[confirmation?.action] || 'Confirm'}
                cancelText="Cancel"
                danger={['deleteGroup', 'deleteMessage', 'removeMember'].includes(confirmation?.action)}
                confirmColor={confirmation?.action === 'archive' ? 'yellow' : 'blue'}
            />
        </AuthenticatedLayout>
    );
}
