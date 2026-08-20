import { Link, router } from '@inertiajs/react';
import { ChatBubbleLeftRightIcon, LockClosedIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function MessageGroupList({ groups = [], routeName, canCreate = false, canManage = false, createGrade = '' }) {
    const archive = (group) => {
        if (confirm(`Archive "${group.name}"? Members will keep the history, but new messages will be disabled.`)) {
            router.post(route('teacher.messages.groups.archive', group.id), {}, { preserveScroll: true });
        }
    };

    const remove = (group) => {
        if (confirm(`Permanently delete "${group.name}" and all its messages? This cannot be undone.`)) {
            router.delete(route('teacher.messages.groups.destroy', group.id), { preserveScroll: true });
        }
    };

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">Group Chats</h2>
                {canCreate && (
                    <Link
                        href={route('teacher.messages.groups.create', createGrade ? { grade_level: createGrade } : {})}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                        Create Group
                    </Link>
                )}
            </div>

            {groups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <UserGroupIcon className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No group chats yet.</p>
                    <p className="mt-1 text-xs text-slate-400">
                        {canCreate ? 'Create a group to start a project or class discussion.' : "You haven't been added to a group yet."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {groups.map((group) => (
                        <div key={group.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                            <Link href={route(routeName, group.id)} className="block">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-slate-800">{group.name}</h3>
                                        <p className="text-xs text-slate-500">
                                            {group.members_count} members{group.subject ? ` · ${group.subject.name}` : ''}
                                        </p>
                                    </div>
                                </div>
                                {group.is_archived && <LockClosedIcon className="h-4 w-4 flex-shrink-0 text-amber-500" title="Archived" />}
                            </div>
                            {group.last_message && (
                                <p className="mt-3 truncate text-sm text-slate-500">{group.last_message}</p>
                            )}
                            {group.is_archived && <p className="mt-2 text-xs font-medium text-amber-700">Archived</p>}
                            </Link>
                            {canManage && (
                                <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                                    {group.is_archived ? (
                                        <button type="button" onClick={() => remove(group)} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800">
                                            <TrashIcon className="h-4 w-4" /> Delete permanently
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => archive(group)} className="text-xs font-medium text-amber-700 hover:text-amber-900">
                                            Remove / Archive
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
