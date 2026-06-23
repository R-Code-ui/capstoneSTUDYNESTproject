import { Link } from '@inertiajs/react';

export default function Pagination({
    links = [],
    currentPage = 1,
    lastPage = 1,
    total = 0,
    perPage = 15,
    onPageChange,
    className = '',
    showSummary = true,
    showPageNumbers = true,
    showFirstLast = true,
    showPrevNext = true,
    size = 'md', // sm, md, lg
    variant = 'default', // default, bordered, outline
}) {
    // Build pagination links if not provided
    const buildLinks = () => {
        const pages = [];
        const maxVisible = 5;

        if (lastPage <= maxVisible) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push({
                    label: i.toString(),
                    url: '#',
                    active: i === currentPage,
                    type: 'page',
                });
            }
        } else {
            const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            const end = Math.min(lastPage, start + maxVisible - 1);

            if (start > 1) {
                pages.push({ label: '1', url: '#', active: false, type: 'page' });
                if (start > 2) {
                    pages.push({ label: '...', url: null, active: false, type: 'ellipsis' });
                }
            }

            for (let i = start; i <= end; i++) {
                pages.push({
                    label: i.toString(),
                    url: '#',
                    active: i === currentPage,
                    type: 'page',
                });
            }

            if (end < lastPage) {
                if (end < lastPage - 1) {
                    pages.push({ label: '...', url: null, active: false, type: 'ellipsis' });
                }
                pages.push({ label: lastPage.toString(), url: '#', active: false, type: 'page' });
            }
        }

        return pages;
    };

    const paginationLinks = links.length > 0 ? links : buildLinks();

    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
        bordered: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
        outline: 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
    };

    const activeClasses = {
        default: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        bordered: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        outline: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
    };

    const handlePageChange = (page) => {
        if (onPageChange && page !== currentPage && page >= 1 && page <= lastPage) {
            onPageChange(page);
        }
    };

    const renderPageLink = (link) => {
        if (link.type === 'ellipsis') {
            return (
                <span
                    key={link.label}
                    className={`inline-flex items-center ${sizeClasses[size]} text-gray-500 dark:text-gray-400`}
                >
                    ...
                </span>
            );
        }

        const isActive = link.active || (link.label === currentPage.toString());

        if (isActive) {
            return (
                <span
                    key={link.label}
                    className={`
                        inline-flex items-center ${sizeClasses[size]}
                        ${activeClasses[variant]}
                        rounded-md font-medium
                        cursor-default
                    `}
                >
                    {link.label}
                </span>
            );
        }

        return (
            <button
                key={link.label}
                onClick={() => handlePageChange(parseInt(link.label))}
                className={`
                    inline-flex items-center ${sizeClasses[size]}
                    ${variantClasses[variant]}
                    rounded-md font-medium
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    cursor-pointer
                `}
            >
                {link.label}
            </button>
        );
    };

    if (lastPage <= 1 && !showSummary) {
        return null;
    }

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* First Page */}
                {showFirstLast && (
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`
                            inline-flex items-center ${sizeClasses[size]}
                            ${currentPage === 1
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : variantClasses[variant] + ' hover:text-blue-600 dark:hover:text-blue-400'
                            }
                            rounded-md font-medium transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        `}
                    >
                        <span className="sr-only">First</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M15.707 4.293a1 1 0 010 1.414L10.414 10l5.293 5.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                            <path
                                fillRule="evenodd"
                                d="M9.707 4.293a1 1 0 010 1.414L4.414 10l5.293 5.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}

                {/* Previous Page */}
                {showPrevNext && (
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`
                            inline-flex items-center ${sizeClasses[size]}
                            ${currentPage === 1
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : variantClasses[variant] + ' hover:text-blue-600 dark:hover:text-blue-400'
                            }
                            rounded-md font-medium transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        `}
                    >
                        <span className="sr-only">Previous</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}

                {/* Page Numbers */}
                {showPageNumbers && (
                    <div className="flex gap-1">
                        {paginationLinks.map((link, index) => (
                            <div key={index}>{renderPageLink(link)}</div>
                        ))}
                    </div>
                )}

                {/* Next Page */}
                {showPrevNext && (
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className={`
                            inline-flex items-center ${sizeClasses[size]}
                            ${currentPage === lastPage
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : variantClasses[variant] + ' hover:text-blue-600 dark:hover:text-blue-400'
                            }
                            rounded-md font-medium transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        `}
                    >
                        <span className="sr-only">Next</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}

                {/* Last Page */}
                {showFirstLast && (
                    <button
                        onClick={() => handlePageChange(lastPage)}
                        disabled={currentPage === lastPage}
                        className={`
                            inline-flex items-center ${sizeClasses[size]}
                            ${currentPage === lastPage
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : variantClasses[variant] + ' hover:text-blue-600 dark:hover:text-blue-400'
                            }
                            rounded-md font-medium transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        `}
                    >
                        <span className="sr-only">Last</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 15.707a1 1 0 010-1.414L9.586 10 4.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                            <path
                                fillRule="evenodd"
                                d="M10.293 15.707a1 1 0 010-1.414L15.586 10l-5.293-5.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Summary */}
            {showSummary && total > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {((currentPage - 1) * perPage) + 1} to{' '}
                    {Math.min(currentPage * perPage, total)} of {total} results
                </div>
            )}
        </div>
    );
}
