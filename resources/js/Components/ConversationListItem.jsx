import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CATEGORY_STYLES = {
    lesson: { label: 'Lesson', color: 'bg-blue-100 text-blue-800' },
    assignment: { label: 'Assignment', color: 'bg-purple-100 text-purple-800' },
    quiz: { label: 'Quiz', color: 'bg-amber-100 text-amber-800' },
    educational_game: { label: 'Game', color: 'bg-emerald-100 text-emerald-800' },
    general_academic_concern: { label: 'Concern', color: 'bg-red-100 text-red-800' },
};

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('');
}

export default function ConversationListItem({ conversation, onClick }) {
    const category = CATEGORY_STYLES[conversation.category] || {
        label: conversation.category,
        color: 'bg-gray-100 text-gray-700',
    };
    const isUnread = conversation.unread_count > 0;

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 py-4 px-2 text-left hover:bg-gray-50 rounded-lg transition"
        >
            {/* Avatar */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {getInitials(conversation.name)}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`truncate ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {conversation.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                        {conversation.last_message_time}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${category.color}`}>
                        {category.label}
                    </span>
                    <span className={`text-sm truncate ${isUnread ? 'text-gray-800' : 'text-gray-500'}`}>
                        {conversation.is_last_from_me ? 'You: ' : ''}{conversation.last_message}
                    </span>
                </div>

                {/* Student info */}
                {conversation.grade_level && (
                    <div className="text-xs text-gray-400 mt-1">
                        {conversation.grade_level}{conversation.lrn ? ` • Student ID: ${conversation.lrn}` : ''}
                    </div>
                )}
            </div>

            {/* Unread badge + chevron */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {isUnread && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-medium bg-red-500 text-white rounded-full">
                        {conversation.unread_count}
                    </span>
                )}
                <ChevronRightIcon className="w-4 h-4 text-gray-300" />
            </div>
        </button>
    );
}
