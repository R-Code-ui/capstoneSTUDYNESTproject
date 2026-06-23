export default function StatsCard({
    title,
    value,
    icon,
    color = 'blue',
    subtitle = '',
    trend = null,
    trendLabel = '',
    className = '',
    onClick,
    loading = false,
    size = 'md', // sm, md, lg
    href = null,
}) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/50',
            border: 'border-blue-200 dark:border-blue-800',
            hover: 'hover:border-blue-300 dark:hover:border-blue-700',
        },
        green: {
            bg: 'bg-green-50 dark:bg-green-900/30',
            text: 'text-green-600 dark:text-green-400',
            iconBg: 'bg-green-100 dark:bg-green-900/50',
            border: 'border-green-200 dark:border-green-800',
            hover: 'hover:border-green-300 dark:hover:border-green-700',
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-900/30',
            text: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-900/50',
            border: 'border-purple-200 dark:border-purple-800',
            hover: 'hover:border-purple-300 dark:hover:border-purple-700',
        },
        orange: {
            bg: 'bg-orange-50 dark:bg-orange-900/30',
            text: 'text-orange-600 dark:text-orange-400',
            iconBg: 'bg-orange-100 dark:bg-orange-900/50',
            border: 'border-orange-200 dark:border-orange-800',
            hover: 'hover:border-orange-300 dark:hover:border-orange-700',
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-900/30',
            text: 'text-red-600 dark:text-red-400',
            iconBg: 'bg-red-100 dark:bg-red-900/50',
            border: 'border-red-200 dark:border-red-800',
            hover: 'hover:border-red-300 dark:hover:border-red-700',
        },
        indigo: {
            bg: 'bg-indigo-50 dark:bg-indigo-900/30',
            text: 'text-indigo-600 dark:text-indigo-400',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
            border: 'border-indigo-200 dark:border-indigo-800',
            hover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
        },
        yellow: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/30',
            text: 'text-yellow-600 dark:text-yellow-400',
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
            border: 'border-yellow-200 dark:border-yellow-800',
            hover: 'hover:border-yellow-300 dark:hover:border-yellow-700',
        },
        teal: {
            bg: 'bg-teal-50 dark:bg-teal-900/30',
            text: 'text-teal-600 dark:text-teal-400',
            iconBg: 'bg-teal-100 dark:bg-teal-900/50',
            border: 'border-teal-200 dark:border-teal-800',
            hover: 'hover:border-teal-300 dark:hover:border-teal-700',
        },
        pink: {
            bg: 'bg-pink-50 dark:bg-pink-900/30',
            text: 'text-pink-600 dark:text-pink-400',
            iconBg: 'bg-pink-100 dark:bg-pink-900/50',
            border: 'border-pink-200 dark:border-pink-800',
            hover: 'hover:border-pink-300 dark:hover:border-pink-700',
        },
        gray: {
            bg: 'bg-gray-50 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-400',
            iconBg: 'bg-gray-100 dark:bg-gray-700',
            border: 'border-gray-200 dark:border-gray-700',
            hover: 'hover:border-gray-300 dark:hover:border-gray-600',
        },
    };

    const sizeClasses = {
        sm: {
            padding: 'p-4',
            iconSize: 'h-8 w-8',
            textSize: 'text-lg',
            valueSize: 'text-xl',
            iconPadding: 'p-2',
        },
        md: {
            padding: 'p-6',
            iconSize: 'h-10 w-10',
            textSize: 'text-sm',
            valueSize: 'text-2xl',
            iconPadding: 'p-2.5',
        },
        lg: {
            padding: 'p-8',
            iconSize: 'h-14 w-14',
            textSize: 'text-base',
            valueSize: 'text-4xl',
            iconPadding: 'p-3.5',
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;
    const sizes = sizeClasses[size] || sizeClasses.md;

    const Wrapper = ({ children }) => {
        if (href) {
            return (
                <a
                    href={href}
                    className={`block transition-all duration-200 ${colors.hover}`}
                >
                    {children}
                </a>
            );
        }
        if (onClick) {
            return (
                <button
                    onClick={onClick}
                    className={`w-full text-left transition-all duration-200 ${colors.hover} cursor-pointer`}
                >
                    {children}
                </button>
            );
        }
        return <>{children}</>;
    };

    if (loading) {
        return (
            <div className={`rounded-xl border ${colors.border} ${colors.bg} ${sizes.padding} animate-pulse ${className}`}>
                <div className="flex items-center gap-4">
                    <div className={`${sizes.iconPadding} rounded-xl ${colors.iconBg}`}>
                        <div className={`${sizes.iconSize} bg-gray-300 dark:bg-gray-600 rounded-lg`} />
                    </div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2" />
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Wrapper>
            <div className={`rounded-xl border ${colors.border} ${colors.bg} ${sizes.padding} transition-all duration-200 ${className}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`${sizes.iconPadding} rounded-xl ${colors.iconBg}`}>
                            {typeof icon === 'string' ? (
                                <span className={`${sizes.iconSize} flex items-center justify-center ${colors.text}`}>
                                    {icon}
                                </span>
                            ) : (
                                <div className={`${sizes.iconSize} ${colors.text}`}>
                                    {icon}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <div className={`${sizes.textSize} font-medium text-gray-500 dark:text-gray-400`}>
                                {title}
                            </div>
                            <div className={`${sizes.valueSize} font-bold text-gray-900 dark:text-white`}>
                                {value !== undefined && value !== null ? value : '—'}
                            </div>
                            {subtitle && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trend */}
                    {trend !== null && trend !== undefined && (
                        <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {trend > 0 ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            ) : trend < 0 ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                </svg>
                            )}
                            <span className="text-sm font-medium">
                                {Math.abs(trend)}%
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Wrapper>
    );
}

// ============================================================
// HELPER: STATS CARD GROUP
// ============================================================

export function StatsCardGroup({ children, columns = 4, className = '' }) {
    const columnClasses = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };

    return (
        <div className={`grid ${columnClasses[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-6 ${className}`}>
            {children}
        </div>
    );
}
