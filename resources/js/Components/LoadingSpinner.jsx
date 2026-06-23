export default function LoadingSpinner({
    size = 'md', // sm, md, lg, xl
    color = 'blue', // blue, white, gray, primary
    className = '',
    overlay = false,
    overlayClassName = '',
    text = '',
    textClassName = '',
    fullPage = false,
    variant = 'spinner', // spinner, dots, pulse
}) {
    const sizeClasses = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
    };

    const colorClasses = {
        blue: 'border-blue-500 dark:border-blue-400',
        white: 'border-white',
        gray: 'border-gray-400 dark:border-gray-500',
        primary: 'border-blue-600 dark:border-blue-400',
        green: 'border-green-500 dark:border-green-400',
        red: 'border-red-500 dark:border-red-400',
        yellow: 'border-yellow-500 dark:border-yellow-400',
    };

    const dotSizeClasses = {
        sm: 'h-1.5 w-1.5',
        md: 'h-2.5 w-2.5',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4.5 w-4.5',
    };

    const dotColorClasses = {
        blue: 'bg-blue-500 dark:bg-blue-400',
        white: 'bg-white',
        gray: 'bg-gray-400 dark:bg-gray-500',
        primary: 'bg-blue-600 dark:bg-blue-400',
        green: 'bg-green-500 dark:bg-green-400',
        red: 'bg-red-500 dark:bg-red-400',
        yellow: 'bg-yellow-500 dark:bg-yellow-400',
    };

    const renderSpinner = () => (
        <div
            className={`
                animate-spin rounded-full
                border-solid border-t-transparent
                ${sizeClasses[size]}
                ${colorClasses[color]}
                ${className}
            `}
        />
    );

    const renderDots = () => {
        const dotSize = dotSizeClasses[size];
        const dotColor = dotColorClasses[color];

        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div
                    className={`${dotSize} ${dotColor} rounded-full animate-bounce delay-0`}
                    style={{ animationDuration: '0.8s' }}
                />
                <div
                    className={`${dotSize} ${dotColor} rounded-full animate-bounce delay-150`}
                    style={{ animationDuration: '0.8s' }}
                />
                <div
                    className={`${dotSize} ${dotColor} rounded-full animate-bounce delay-300`}
                    style={{ animationDuration: '0.8s' }}
                />
            </div>
        );
    };

    const renderPulse = () => (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative">
                <div
                    className={`
                        rounded-full
                        ${sizeClasses[size]}
                        ${colorClasses[color]}
                        animate-ping
                        opacity-75
                    `}
                />
                <div
                    className={`
                        rounded-full
                        ${sizeClasses[size]}
                        ${colorClasses[color]}
                        absolute inset-0
                        animate-pulse
                    `}
                />
            </div>
        </div>
    );

    const renderSpinnerContent = () => {
        switch (variant) {
            case 'dots':
                return renderDots();
            case 'pulse':
                return renderPulse();
            default:
                return renderSpinner();
        }
    };

    // Full page spinner
    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    {renderSpinnerContent()}
                    {text && (
                        <span className={`text-sm text-gray-600 dark:text-gray-300 ${textClassName}`}>
                            {text}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Overlay spinner
    if (overlay) {
        return (
            <div
                className={`
                    absolute inset-0 z-20 flex items-center justify-center
                    bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
                    rounded-lg
                    ${overlayClassName}
                `}
            >
                <div className="flex flex-col items-center gap-3">
                    {renderSpinnerContent()}
                    {text && (
                        <span className={`text-sm text-gray-600 dark:text-gray-300 ${textClassName}`}>
                            {text}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Inline spinner
    return (
        <div className="flex flex-col items-center gap-3">
            {renderSpinnerContent()}
            {text && (
                <span className={`text-sm text-gray-500 dark:text-gray-400 ${textClassName}`}>
                    {text}
                </span>
            )}
        </div>
    );
}

// Helper: Skeleton loading component
export function SkeletonLoader({
    className = '',
    count = 1,
    height = 'h-12',
    rounded = 'rounded-lg',
}) {
    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((i) => (
                <div
                    key={i}
                    className={`
                        ${height} ${rounded}
                        bg-gray-200 dark:bg-gray-700
                        animate-pulse
                    `}
                />
            ))}
        </div>
    );
}

// Helper: Skeleton for table rows
export function TableSkeleton({ columns = 4, rows = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }, (_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                    {Array.from({ length: columns }, (_, colIndex) => (
                        <div
                            key={colIndex}
                            className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                            style={{ width: `${100 / columns}%` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
