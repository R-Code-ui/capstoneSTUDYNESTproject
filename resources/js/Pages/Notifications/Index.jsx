import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const colors = { urgent: 'bg-rose-100 text-rose-700', important: 'bg-amber-100 text-amber-700', normal: 'bg-sky-100 text-sky-700' };

export default function Index({ notifications, pagination }) {
    const items = notifications?.data || notifications || [];
    const markAll = () => router.post(route('notifications.read-all'));
    return <AuthenticatedLayout>
        <Head title="Notifications" />
        <div className="notification-center-page mx-auto max-w-4xl">
            <style>{`
                .studynest-layout.theme-dark .notification-center-page .notification-center-list { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-item { border-color: rgb(51 65 85) !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-item-unread { background-color: rgb(23 37 84 / 0.55) !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-icon { background-color: rgb(30 41 59) !important; color: rgb(148 163 184) !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-open-action { background-color: rgb(37 99 235) !important; color: white !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-read-action { background-color: rgb(30 41 59) !important; border-color: rgb(71 85 105) !important; color: rgb(203 213 225) !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-pagination-link { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; color: rgb(203 213 225) !important; }
                .studynest-layout.theme-dark .notification-center-page .notification-pagination-link-active { background-color: rgb(79 70 229) !important; border-color: rgb(99 102 241) !important; color: white !important; }
                .studynest-layout.theme-dark .notification-center-page .text-slate-900 { color: rgb(241 245 249) !important; }
                .studynest-layout.theme-dark .notification-center-page .text-slate-800 { color: rgb(226 232 240) !important; }
                .studynest-layout.theme-dark .notification-center-page .text-slate-600, .studynest-layout.theme-dark .notification-center-page .text-slate-500, .studynest-layout.theme-dark .notification-center-page .text-slate-400 { color: rgb(148 163 184) !important; }
            `}</style>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">System Notifications</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Notification Center</h1><p className="mt-1 text-sm text-slate-500">Stay updated with your StudyNest activities.</p></div>{items.some((item) => !item.read_at) && <button type="button" onClick={markAll} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Mark all as read</button>}</div>
            <div className="notification-center-list overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {items.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">You are all caught up. New system notifications will appear here.</div> : items.map((notification) => <div key={notification.id} className={`notification-item flex min-w-0 gap-4 border-b border-slate-100 p-5 last:border-b-0 ${notification.read_at ? '' : 'notification-item-unread bg-indigo-50/40'}`}><span className="notification-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17H9m9-3V9a6 6 0 10-12 0v5l-2 2h16l-2-2z" /></svg></span><div className="min-w-0 flex-1 overflow-hidden"><div className="flex min-w-0 flex-wrap items-center gap-2"><h2 className="min-w-0 truncate font-bold text-slate-800">{notification.title}</h2><span className={`notification-priority-badge shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${colors[notification.priority] || colors.normal}`}>{notification.priority}</span>{!notification.read_at && <span className="notification-new-badge shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">New</span>}</div><p className="notification-message mt-1 truncate text-sm text-slate-600">{notification.message}</p><p className="mt-2 text-xs text-slate-400">{notification.created_at}</p></div><div className="flex shrink-0 items-center gap-2">{notification.url && <button type="button" onClick={() => router.post(route('notifications.read', notification.id), { open: true })} className="notification-open-action rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700">Open</button>}{!notification.read_at && <button type="button" onClick={() => router.post(route('notifications.read', notification.id))} className="notification-read-action rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Read</button>}</div></div>)}
            </div>
            {pagination?.links && <div className="mt-4 flex flex-wrap gap-2">{pagination.links.map((link, index) => link.url ? <Link key={index} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} className={`notification-pagination-link rounded-lg border px-3 py-1.5 text-sm ${link.active ? 'notification-pagination-link-active border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`} /> : <span key={index} dangerouslySetInnerHTML={{ __html: link.label }} className="rounded-lg border border-slate-100 px-3 py-1.5 text-sm text-slate-300" />)}</div>}
        </div>
    </AuthenticatedLayout>;
}
