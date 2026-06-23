import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function ActivityFeed({
    activities = [],
    title = 'Recent Activities',
    showViewAll = true,
    viewAllLink = '#',
    viewAllText = 'View All Activities',
    limit = 5,
    className = '',
    emptyMessage = 'No recent activities.',
    showTimestamps = true,
    showAvatars = true,
    compact = false,
    variant = 'default', // default, timeline, bordered
}) {
    const [showAll, setShowAll] = useState(false);

    const displayActivities = showAll ? activities : activities.slice(0, limit);

    const getActivityIcon = (type) => {
        const icons = {
            login: '🔑',
            logout: '🚪',
            lesson: '📚',
            assignment: '📝',
            quiz: '📊',
            game: '🎮',
            announcement: '📢',
            message: '💬',
            create: '➕',
            update: '✏️',
            delete: '🗑️',
            publish: '📤',
            archive: '📦',
            complete: '✅',
            submit: '📩',
            grade: '📋',
            view: '👁️',
        };
        return icons[type] || '📌';
    };

    const getActivityColor = (type) => {
        const colors = {
            login: 'text-blue-500 dark:text-blue-400',
            logout: 'text-gray-500 dark:text-gray-400',
            lesson: 'text-purple-500 dark:text-purple-400',
            assignment: 'text-orange-500 dark:text-orange-400',
            quiz: 'text-red-500 dark:text-red-400',
            game: 'text-green-500 dark:text-green-400',
            announcement: 'text-indigo-500 dark:text-indigo-400',
            message: 'text-cyan-500 dark:text-cyan-400',
            create: 'text-green-500 dark:text-green-400',
            update: 'text-yellow-500 dark:text-yellow-400',
            delete: 'text-red-500 dark:text-red-400',
            publish: 'text-blue-500 dark:text-blue-400',
            archive: 'text-gray-500 dark:text-gray-400',
            complete: 'text-green-500 dark:text-green-400',
            submit: 'text-purple-500 dark:text-purple-400',
            grade: 'text-indigo-500 dark:text-indigo-400',
            view: 'text-cyan-500 dark:text-cyan-400',
        };
        return colors[type] || 'text-gray-500 dark:text-gray-400';
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const variantClasses = {
        default: 'space-y-3',
        timeline: 'space-y-4 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700 pl-12',
        bordered: 'space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700',
    };

    if (activities.length === 0) {
        return (
            <div className={`${className}`}>
                {title && (
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {title}
                    </h4>
                )}
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h4>
                    {showViewAll && activities.length > limit && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {showAll ? 'Show Less' : viewAllText}
                        </button>
                    )}
                </div>
            )}

            <div className={`${variantClasses[variant]} ${className}`}>
                {displayActivities.map((activity, index) => (
                    <div
                        key={activity.id || index}
                        className={`
                            ${variant === 'bordered' ? 'px-4 py-3' : ''}
                            ${variant === 'default' ? 'flex items-start gap-3' : ''}
                            ${variant === 'timeline' ? 'relative' : ''}
                            transition-colors
                        `}
                    >
                        {/* Timeline dot */}
                        {variant === 'timeline' && (
                            <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                                <span className="text-lg">
                                    {getActivityIcon(activity.type)}
                                </span>
                            </div>
                        )}

                        {/* Avatar */}
                        {variant !== 'timeline' && showAvatars && (
                            <div className="flex-shrink-0">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    ${activity.avatar ? '' : 'bg-gray-200 dark:bg-gray-700'}
                                    ${getActivityColor(activity.type)}
                                `}>
                                    {activity.avatar ? (
                                        <img
                                            src={activity.avatar}
                                            alt={activity.user}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                            {activity.user?.charAt(0) || '?'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${variant !== 'default' ? 'pl-3' : ''}`}>
                            <div className={`${compact ? 'text-sm' : ''}`}>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {activity.user || 'Unknown'}
                                </span>
                                <span className="text-gray-600 dark:text-gray-300">
                                    {' '}
                                    {activity.action || ''}
                                </span>
                                {activity.target && (
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                        {' '}
                                        {activity.target}
                                    </span>
                                )}
                            </div>
                            {activity.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {activity.description}
                                </div>
                            )}
                            {showTimestamps && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {activity.time ? formatTime(activity.time) : activity.timestamp || ''}
                                </div>
                            )}
                        </div>

                        {/* Action button */}
                        {activity.actionLink && (
                            <div className="flex-shrink-0">
                                <Link
                                    href={activity.actionLink}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    {activity.actionText || 'View'}
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// HELPER: ACTIVITY FEED ITEM
// ============================================================

export function ActivityItem({
    user,
    action,
    target,
    description,
    time,
    type = 'default',
    icon = null,
    avatar = null,
    link = null,
    linkText = 'View',
    compact = false,
    children,
}) {
    const colors = {
        default: 'text-gray-500 dark:text-gray-400',
        login: 'text-blue-500 dark:text-blue-400',
        lesson: 'text-purple-500 dark:text-purple-400',
        assignment: 'text-orange-500 dark:text-orange-400',
        quiz: 'text-red-500 dark:text-red-400',
        game: 'text-green-500 dark:text-green-400',
        announcement: 'text-indigo-500 dark:text-indigo-400',
        message: 'text-cyan-500 dark:text-cyan-400',
        create: 'text-green-500 dark:text-green-400',
        update: 'text-yellow-500 dark:text-yellow-400',
        delete: 'text-red-500 dark:text-red-400',
        publish: 'text-blue-500 dark:text-blue-400',
        archive: 'text-gray-500 dark:text-gray-400',
        complete: 'text-green-500 dark:text-green-400',
        submit: 'text-purple-500 dark:text-purple-400',
        grade: 'text-indigo-500 dark:text-indigo-400',
        view: 'text-cyan-500 dark:text-cyan-400',
    };

    const iconMap = {
        login: '🔑',
        logout: '🚪',
        lesson: '📚',
        assignment: '📝',
        quiz: '📊',
        game: '🎮',
        announcement: '📢',
        message: '💬',
        create: '➕',
        update: '✏️',
        delete: '🗑️',
        publish: '📤',
        archive: '📦',
        complete: '✅',
        submit: '📩',
        grade: '📋',
        view: '👁️',
        default: '📌',
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`flex items-start gap-3 py-2 ${compact ? 'text-sm' : ''}`}>
            {/* Icon/Avatar */}
            <div className="flex-shrink-0">
                {avatar ? (
                    <img
                        src={avatar}
                        alt={user}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${colors[type] || colors.default}`}>
                        <span className="text-lg">
                            {icon || iconMap[type] || iconMap.default}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {user}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                        {' '}{action}
                    </span>
                    {target && (
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                            {' '}{target}
                        </span>
                    )}
                </div>
                {description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </div>
                )}
                {children}
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTime(time)}
                </div>
            </div>

            {/* Action Link */}
            {link && (
                <div className="flex-shrink-0">
                    <Link
                        href={link}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {linkText}
                    </Link>
                </div>
            )}
        </div>
    );
}
