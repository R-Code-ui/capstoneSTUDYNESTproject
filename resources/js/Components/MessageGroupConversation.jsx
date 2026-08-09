import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { ArrowLeftIcon, ArchiveBoxIcon, PencilSquareIcon, PaperAirplaneIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function MessageGroupConversation({ group, isTeacher = false, canManage = false }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const bottomRef = useRef(null);
    const { data, setData, errors, post, reset } = useForm({ body: '' });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [group.messages.length]);

    const routePrefix = isTeacher ? 'teacher' : 'student';
    const send = (event) => {
        event.preventDefault();
        if (!data.body.trim() || group.is_archived) return;
        setIsSubmitting(true);
        post(route(`${routePrefix}.messages.groups.send`, group.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const archive = () => {
        if (confirm('Archive this group? Members will still see existing messages but cannot send new ones.')) {
            router.post(route('teacher.messages.groups.archive', group.id), {}, { preserveScroll: true });
        }
    };

    const restore = () => router.post(route('teacher.messages.groups.restore', group.id), {}, { preserveScroll: true });
    const remove = () => {
        if (confirm('Delete this archived group and all of its messages? This cannot be undone.')) {
            router.delete(route('teacher.messages.groups.destroy', group.id));
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
                            {group.is_archived ? <SecondaryButton onClick={restore}>Restore</SecondaryButton> : <SecondaryButton onClick={archive}><ArchiveBoxIcon className="mr-1 h-4 w-4" />Archive</SecondaryButton>}
                            {group.is_archived && <button onClick={remove} className="rounded-md p-2 text-red-500 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>}
                        </div>
                    )}
                </div>
            }
        >
            <Head title={group.name} />
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {group.is_archived && <div className="bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">This group has been archived. New messages are disabled.</div>}
                    {group.description && <p className="border-b border-slate-100 px-5 py-4 text-sm text-slate-600">{group.description}</p>}
                    <div className="max-h-[55vh] min-h-[320px] space-y-4 overflow-y-auto p-5">
                        {group.messages.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No messages yet.</p> : group.messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender_id === group.owner_id ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender_id === group.owner_id ? 'bg-blue-50 text-blue-950' : 'bg-slate-100 text-slate-800'}`}>
                                    <p className="mb-1 text-xs font-bold text-slate-500">{message.sender_name}{message.sender_id === group.owner_id ? ' · Teacher' : ''}</p>
                                    <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                                    <p className="mt-2 text-[11px] text-slate-400">{message.created_at}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    <form onSubmit={send} className="border-t border-slate-200 p-4">
                        <div className="flex items-end gap-2">
                            <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} disabled={group.is_archived} rows={2} placeholder={group.is_archived ? 'Group archived' : 'Write a message...'} className="flex-1 resize-none rounded-md border-gray-300 text-sm shadow-sm" />
                            <PrimaryButton disabled={isSubmitting || group.is_archived || !data.body.trim()}><PaperAirplaneIcon className="h-4 w-4" /></PrimaryButton>
                        </div>
                        <InputError message={errors.body} className="mt-1" />
                    </form>
                </div>

                <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 font-semibold text-slate-800"><UserGroupIcon className="h-5 w-5" /> Members</h2>
                    <div className="mt-4 space-y-3">
                        {group.members.map((member) => <div key={member.id} className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-700">{member.name}</p><p className="text-xs text-slate-400">{member.is_owner ? 'Group owner' : member.grade_level}</p></div>{canManage && !member.is_owner && <button title="Remove member" onClick={() => { if (confirm(`Remove ${member.name} from this group?`)) router.delete(route('teacher.messages.groups.members.remove', [group.id, member.id]), { preserveScroll: true }); }} className="text-xs text-red-500 hover:text-red-700">Remove</button>}</div>)}
                    </div>
                </aside>
            </div>
        </AuthenticatedLayout>
    );
}
