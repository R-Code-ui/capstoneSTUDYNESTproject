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
            className={`flex w-full items-center gap-3 rounded-lg py-2.5 px-4 text-sm font-semibold transition-all duration-150 ease-in-out border-l-4 ${
                active
                    ? 'border-[#5EC4D2] bg-[#22486A] text-[#5EC4D2]'
                    : 'border-transparent text-[#7DD3E1]/70 hover:border-[#7DD3E1] hover:bg-[#1A3752] hover:text-white'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
