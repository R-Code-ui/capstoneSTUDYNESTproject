export default function ReportCard({
    title,
    description,
    icon,
    selected = false,
    onClick,
    className = '',
    color = 'blue',
}) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-600 dark:text-blue-400',
            hover: 'hover:border-blue-300 dark:hover:border-blue-700',
            ring: 'ring-2 ring-blue-500 dark:ring-blue-400',
        },
        green: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-600 dark:text-green-400',
            hover: 'hover:border-green-300 dark:hover:border-green-700',
            ring: 'ring-2 ring-green-500 dark:ring-green-400',
        },
        orange: {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800',
            text: 'text-orange-600 dark:text-orange-400',
            hover: 'hover:border-orange-300 dark:hover:border-orange-700',
            ring: 'ring-2 ring-orange-500 dark:ring-orange-400',
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-600 dark:text-red-400',
            hover: 'hover:border-red-300 dark:hover:border-red-700',
            ring: 'ring-2 ring-red-500 dark:ring-red-400',
        },
        indigo: {
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            border: 'border-indigo-200 dark:border-indigo-800',
            text: 'text-indigo-600 dark:text-indigo-400',
            hover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
            ring: 'ring-2 ring-indigo-500 dark:ring-indigo-400',
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800',
            text: 'text-purple-600 dark:text-purple-400',
            hover: 'hover:border-purple-300 dark:hover:border-purple-700',
            ring: 'ring-2 ring-purple-500 dark:ring-purple-400',
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left p-6 rounded-xl border-2 transition-all duration-200
                ${colors.bg} ${colors.border}
                ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'cursor-default'}
                ${selected ? `${colors.ring} border-transparent` : ''}
                ${className}
            `}
        >
            <div className="flex flex-col items-center text-center">
                {icon && (
                    <div className={`mb-3 ${colors.text}`}>
                        {typeof icon === 'string' ? (
                            <span className="text-4xl">{icon}</span>
                        ) : (
                            icon
                        )}
                    </div>
                )}
                <h4 className="font-semibold text-gray-900 dark:text-white">
                    {title}
                </h4>
                {description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </button>
    );
}
