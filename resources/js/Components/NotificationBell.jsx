import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const colors = { urgent: 'bg-rose-100 text-rose-700', important: 'bg-amber-100 text-amber-700', normal: 'bg-sky-100 text-sky-700' };

function Icon({ type = 'bell' }) {
    const paths = {
        assignment: 'M4 5h16M4 9h16M4 13h10M4 17h7',
        message: 'M8 10h8M8 14h5M5 19l-1 2 4-2h8a4 4 0 004-4V7a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z',
        megaphone: 'M3 11l18-5v12L3 14v-3zM3 14l2 6h4l-2-6',
        bell: 'M15 17H9m9-3V9a6 6 0 10-12 0v5l-2 2h16l-2-2z',
    };
    return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={paths[type] || paths.bell} /></svg></span>;
}

export default function NotificationBell() {
    const { auth } = usePage().props;
    const notifications = auth?.notifications || { unread_count: 0, items: [] };
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const refreshNotifications = () => {
            router.reload({
                only: ['auth'],
                preserveState: true,
                preserveScroll: true,
            });
        };

        const interval = window.setInterval(refreshNotifications, 15000);

        return () => window.clearInterval(interval);
    }, []);

    const openNotification = (notification) => {
        router.post(route('notifications.read', notification.id), {}, { preserveScroll: true });
    };

    return <div className="relative">
        <button type="button" onClick={() => setOpen((value) => !value)} className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Open notifications">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17H9m9-3V9a6 6 0 10-12 0v5l-2 2h16l-2-2z" /></svg>
            {notifications.unread_count > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{notifications.unread_count > 99 ? '99+' : notifications.unread_count}</span>}
        </button>
        {open && <>
            <button className="fixed inset-0 z-10 h-full w-full cursor-default" onClick={() => setOpen(false)} aria-label="Close notifications" />
            <div className="absolute right-0 z-20 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h3 className="font-bold text-slate-800">Notifications</h3><p className="text-xs text-slate-500">{notifications.unread_count} unread</p></div><Link href={route('notifications.index')} onClick={() => setOpen(false)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all</Link></div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.items.length === 0 ? <div className="px-6 py-10 text-center text-sm text-slate-500">You are all caught up.</div> : notifications.items.map((notification) => <button key={notification.id} type="button" onClick={() => openNotification(notification)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${notification.read_at ? 'bg-white' : 'bg-indigo-50/50'}`}><Icon type={notification.icon} /><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-slate-800">{notification.title}</span>{!notification.read_at && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${colors[notification.priority] || colors.normal}`}>{notification.priority}</span>}</span><span className="mt-0.5 block text-xs leading-5 text-slate-600">{notification.message}</span><span className="mt-1 block text-[11px] text-slate-400">{notification.created_at}</span></span></button>)}
                </div>
            </div>
        </>}
    </div>;
}
