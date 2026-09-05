import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChatBubbleLeftRightIcon, LockClosedIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

export default function MessageGroupList({ groups = [], pagination, routeName, canCreate = false, canManage = false, createGrade = '' }) {
    const [confirmation, setConfirmation] = useState(null);

    const confirmAction = () => {
        if (!confirmation) return;
        const { action, group } = confirmation;

        if (action === 'archive') {
            router.post(route('teacher.messages.groups.archive', group.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Group archived successfully.');
                    setConfirmation(null);
                },
                onError: () => toast.error('Unable to archive the group. Please try again.'),
            });
            return;
        }

        router.delete(route('teacher.messages.groups.destroy', group.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Group deleted successfully.');
                setConfirmation(null);
            },
            onError: () => toast.error('Unable to delete the group. Please try again.'),
        });
    };

    return (
        <section className="message-group-list mb-8">
            <style>{`
                .studynest-layout.theme-dark .message-group-list .message-group-card,
                .studynest-layout.theme-dark .message-group-list .message-group-empty {
                    background-color: rgb(15 23 42) !important;
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .message-group-list .message-group-card-title { color: rgb(241 245 249) !important; }
                .studynest-layout.theme-dark .message-group-list .message-group-card-copy,
                .studynest-layout.theme-dark .message-group-list .message-group-empty-copy { color: rgb(148 163 184) !important; }
                .message-group-card { transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
                @media (hover: hover) and (pointer: fine) {
                    .message-group-card:hover { transform: translateY(-2px); }
                }
                @media (hover: none), (prefers-reduced-motion: reduce) {
                    .message-group-card { transform: none !important; transition-duration: .01ms !important; }
                }
            `}</style>
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">Group Chats</h2>
                {canCreate && (
                    <Link
                        href={route('teacher.messages.groups.create', createGrade ? { grade_level: createGrade } : {})}
                        className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-300 dark:hover:bg-slate-800"
                    >
                        Create Group
                    </Link>
                )}
            </div>

            {groups.length === 0 ? (
                <div className="message-group-empty rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <UserGroupIcon className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-200">No group chats yet.</p>
                    <p className="message-group-empty-copy mt-1 text-xs text-slate-400">
                        {canCreate ? 'Create a group to start a project or class discussion.' : "You haven't been added to a group yet."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {groups.map((group) => (
                        <div key={group.id} className="message-group-card min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md">
                            <Link href={route(routeName, group.id)} className="block min-h-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="message-group-card-title break-words font-semibold text-slate-800">{group.name}</h3>
                                        <p className="message-group-card-copy break-words text-xs text-slate-500">
                                            {group.members_count} members{group.subject ? ` · ${group.subject.name}` : ''}
                                        </p>
                                    </div>
                                </div>
                                {group.is_archived && <LockClosedIcon className="h-4 w-4 flex-shrink-0 text-amber-500" title="Archived" />}
                            </div>
                            {group.last_message && (
                                <p className="message-group-card-copy mt-3 line-clamp-2 break-words text-sm text-slate-500">{group.last_message}</p>
                            )}
                            {group.is_archived && <p className="mt-2 text-xs font-medium text-amber-700">Archived</p>}
                            </Link>
                            {canManage && (
                                <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                                    {group.is_archived ? (
                                        <button type="button" onClick={() => setConfirmation({ action: 'delete', group })} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800">
                                            <TrashIcon className="h-4 w-4" /> Delete permanently
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => setConfirmation({ action: 'archive', group })} className="text-xs font-medium text-amber-700 hover:text-amber-900">
                                            Remove / Archive
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {pagination && pagination.total > 0 && (
                <Pagination pagination={pagination} />
            )}
            <ConfirmModal
                show={Boolean(confirmation)}
                onClose={() => setConfirmation(null)}
                onConfirm={confirmAction}
                title={confirmation?.action === 'archive' ? 'Archive group?' : 'Delete group permanently?'}
                message={confirmation?.action === 'archive'
                    ? `Archive “${confirmation?.group?.name || 'this group'}”? Members will keep the history, but new messages will be disabled.`
                    : `Permanently delete “${confirmation?.group?.name || 'this group'}” and all its messages? This action cannot be undone.`}
                confirmText={confirmation?.action === 'archive' ? 'Archive' : 'Delete permanently'}
                cancelText="Cancel"
                danger={confirmation?.action === 'delete'}
                confirmColor="yellow"
            />
        </section>
    );
}
