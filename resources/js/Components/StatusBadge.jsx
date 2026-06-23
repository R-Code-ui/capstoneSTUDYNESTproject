export default function StatusBadge({
    status,
    label,
    size = 'md', // sm, md, lg
    variant = 'default', // default, dot, pill
    className = '',
    showIcon = true,
    pulse = false,
}) {
    // Map status to variant
    const statusMap = {
        // Active/Published states
        active: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Active' },
        published: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Published' },
        completed: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Completed' },
        passed: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Passed' },
        graded: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Graded' },
        excellent: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Excellent' },

        // Draft/Pending states
        draft: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Draft' },
        pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Pending' },
        in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'In Progress' },
        started: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Started' },
        needs_monitoring: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Needs Monitoring' },
        important: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Important' },

        // Error/Danger states
        archived: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-500', label: 'Archived' },
        inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-500', label: 'Inactive' },
        failed: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500', label: 'Failed' },
        needs_support: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500', label: 'Needs Support' },
        incomplete: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500', label: 'Incomplete' },
        not_submitted: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500', label: 'Not Submitted' },
        urgent: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500', label: 'Urgent' },

        // Info states
        submitted: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500', label: 'Submitted' },
        reviewed: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500', label: 'Reviewed' },
        returned: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500', label: 'Returned' },
        unread: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500', label: 'Unread' },
        normal: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500', label: 'Normal' },
        read: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-400', label: 'Read' },
        replied: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500', label: 'Replied' },
        not_started: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-400', label: 'Not Started' },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const iconSizeClasses = {
        sm: 'h-2.5 w-2.5',
        md: 'h-3 w-3',
        lg: 'h-3.5 w-3.5',
    };

    // Get status config
    const config = statusMap[status] || {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500',
        label: status?.replace(/_/g, ' ').toUpperCase() || 'Unknown',
    };

    const displayLabel = label || config.label;

    const variantClasses = {
        default: '',
        dot: 'pl-2.5',
        pill: 'rounded-full',
    };

    if (variant === 'pill') {
        return (
            <span
                className={`
                    inline-flex items-center gap-1.5
                    ${config.bg} ${config.text}
                    ${sizeClasses[size]}
                    rounded-full font-medium
                    ${pulse ? 'animate-pulse' : ''}
                    ${className}
                `}
            >
                {showIcon && (
                    <span className={`${iconSizeClasses[size]} ${config.dot} rounded-full`} />
                )}
                {displayLabel}
            </span>
        );
    }

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                ${config.bg} ${config.text}
                ${sizeClasses[size]}
                rounded-md font-medium
                ${pulse ? 'animate-pulse' : ''}
                ${variantClasses[variant]}
                ${className}
            `}
        >
            {showIcon && variant === 'dot' && (
                <span className={`${iconSizeClasses[size]} ${config.dot} rounded-full`} />
            )}
            {displayLabel}
        </span>
    );
}

// Helper: Status badge with icon variants
export function StatusIcon({ status, size = 'md', className = '' }) {
    const icons = {
        active: '✅',
        published: '📗',
        draft: '📝',
        archived: '📦',
        completed: '✅',
        pending: '⏳',
        submitted: '📤',
        graded: '📊',
        failed: '❌',
        passed: '🎉',
        urgent: '🚨',
        important: '⭐',
        normal: 'ℹ️',
        unread: '📨',
        read: '📖',
        replied: '💬',
        not_started: '⏸️',
        in_progress: '🔄',
        needs_support: '🆘',
        needs_monitoring: '👀',
        excellent: '🌟',
    };

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
    };

    const icon = icons[status] || '📌';

    return (
        <span className={`${sizeClasses[size]} ${className}`}>
            {icon}
        </span>
    );
}
