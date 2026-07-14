import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function GameShell({ title, description, roundLabel, onExit, children }) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={onExit}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Exit
                </button>
                {roundLabel && (
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {roundLabel}
                    </span>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                        {description}
                    </p>
                )}
                {children}
            </div>
        </div>
    );
}
