export default function PriorityBadge({
    priority,
    size = 'sm', // sm, md, lg
    className = '',
    showIcon = true,
}) {
    const priorityMap = {
        normal: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-800 dark:text-blue-300',
            label: 'Normal',
            icon: 'ℹ️',
        },
        important: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-800 dark:text-yellow-300',
            label: 'Important',
            icon: '⭐',
        },
        urgent: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-300',
            label: 'Urgent',
            icon: '🚨',
        },
    };

    const config = priorityMap[priority] || priorityMap.normal;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const iconSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1
                ${config.bg} ${config.text}
                ${sizeClasses[size]}
                rounded-full font-medium
                ${className}
            `}
        >
            {showIcon && (
                <span className={iconSizeClasses[size]}>{config.icon}</span>
            )}
            {config.label}
        </span>
    );
}
