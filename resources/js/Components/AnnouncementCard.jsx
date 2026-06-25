import { Link } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';

export default function AnnouncementCard({
    announcement,
    onClick,
    showFullContent = false,
    className = '',
}) {
    const getPriorityBadge = (priority) => {
        return <PriorityBadge priority={priority} />;
    };

    const truncateContent = (content, maxLength = 150) => {
        if (!content) return '';
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    };

    const getAudienceLabel = (audience) => {
        return audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    };

    const cardContent = (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {announcement.title}
                        </h3>
                        {announcement.is_pinned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                📌 Pinned
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{announcement.category}</span>
                        <span>•</span>
                        <span>Audience: {getAudienceLabel(announcement.audience)}</span>
                        <span>•</span>
                        <span>{announcement.created_at}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {getPriorityBadge(announcement.priority)}
                    <StatusBadge status={announcement.status} size="sm" />
                </div>
            </div>

            <div className="mt-3 text-gray-700 dark:text-gray-300">
                {showFullContent ? (
                    <div className="whitespace-pre-wrap">{announcement.content}</div>
                ) : (
                    <div>{truncateContent(announcement.content)}</div>
                )}
            </div>

            {announcement.view_count !== undefined && (
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Views: {announcement.view_count}
                </div>
            )}
        </div>
    );

    if (onClick) {
        return (
            <button onClick={() => onClick(announcement)} className="w-full text-left">
                {cardContent}
            </button>
        );
    }

    return cardContent;
}
