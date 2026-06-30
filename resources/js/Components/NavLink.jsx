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
                'flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl tracking-wide transition-all duration-200 group gap-3 ' +
                (active
                    ? 'bg-[#5EC4D2] text-[#22486A] shadow-lg shadow-[#5EC4D2]/10 translate-x-1'
                    : 'text-[#7DD3E1]/80 hover:bg-[#1A3752] hover:text-white hover:translate-x-0.5') +
                className
            }
        >
            {/* Active Visual indicator bullet */}
            <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                active ? 'bg-[#22486A] scale-125' : 'bg-[#5EC4D2]/40 group-hover:bg-[#5EC4D2]'
            }`} />
            {children}
        </Link>
    );
}
