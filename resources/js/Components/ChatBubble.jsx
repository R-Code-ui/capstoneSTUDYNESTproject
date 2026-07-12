const CATEGORY_LABELS = {
    lesson: 'Lesson',
    assignment: 'Assignment',
    quiz: 'Quiz',
    educational_game: 'Game',
    general_academic_concern: 'Concern',
};

export default function ChatBubble({ message }) {
    const isMine = message.is_mine;

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                        isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}
                >
                    {message.message}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {message.created_at}
                    </span>
                    {!isMine && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {CATEGORY_LABELS[message.category] || message.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
