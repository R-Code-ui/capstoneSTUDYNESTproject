import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function GameShell({ title, description, roundLabel, onExit, children }) {
    return (
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <button
                    type="button"
                    onClick={onExit}
                    className="flex items-center gap-1 text-sm sm:text-base text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Exit
                </button>
                {roundLabel && (
                    <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">
                        {roundLabel}
                    </span>
                )}
            </div>

            <div className="flex flex-col min-h-[60vh] lg:min-h-[68vh] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 lg:mb-8 text-center max-w-2xl mx-auto">
                        {description}
                    </p>
                )}
                <div className="flex-1 flex flex-col justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
