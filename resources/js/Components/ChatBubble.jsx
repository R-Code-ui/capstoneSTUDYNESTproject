import { TrashIcon } from '@heroicons/react/24/outline';

const CATEGORY_LABELS = {
    lesson: 'Lesson',
    assignment: 'Assignment',
    quiz: 'Quiz',
    educational_game: 'Game',
    general_academic_concern: 'Concern',
};

const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase();
};

export default function ChatBubble({
    message,
    senderName = '',
    senderRole = '',
    startsGroup = true,
    endsGroup = true,
    onDelete = null,
}) {
    const isMine = message.is_mine;

    return (
        <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${startsGroup ? 'pt-3' : 'pt-1'}`}>
            {!isMine && (
                <div className="w-8 shrink-0">
                    {endsGroup && (
                        <div className="direct-message-avatar flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700" title={senderName}>
                            {getInitials(senderName)}
                        </div>
                    )}
                </div>
            )}
            <div className={`flex min-w-0 max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && startsGroup && (
                    <p className="direct-message-sender mb-1 max-w-full truncate px-1 text-xs font-semibold text-slate-500">
                        {senderName}{senderRole ? ` · ${senderRole}` : ''}
                    </p>
                )}
                <div
                    className={`student-chat-text min-w-0 rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                            ? 'direct-message-own bg-blue-600 text-white'
                            : 'student-incoming-message bg-slate-100 text-slate-800'
                    }`}
                >
                    <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words">{message.message}</p>
                        {onDelete && (
                            <button type="button" onClick={onDelete} className="direct-message-delete shrink-0 rounded text-blue-100 transition hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300" title="Remove message from your messages" aria-label="Remove message">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
                {endsGroup && (
                    <div className="mt-1 flex items-center gap-2 px-1">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">{message.created_at}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{CATEGORY_LABELS[message.category] || message.category}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
