import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center gap-3 rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-150 ${
                active
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
