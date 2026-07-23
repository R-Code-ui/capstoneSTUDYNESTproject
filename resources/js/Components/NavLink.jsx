import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 gap-3 ' +
                (active
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
