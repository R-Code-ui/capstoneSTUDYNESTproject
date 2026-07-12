import { Link } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function Pagination({ pagination, className = '' }) {
    if (!pagination || pagination.total === 0) {
        return null;
    }

    const {
        current_page = 1,
        last_page = 1,
        per_page = 10,
        total = 0,
        links = [],
    } = pagination;

    // If no links provided, build them manually
    const buildLinks = () => {
        if (links && links.length > 0) {
            return links;
        }

        const builtLinks = [];
        const maxVisible = 5;
        let start = Math.max(1, current_page - Math.floor(maxVisible / 2));
        let end = Math.min(last_page, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        // Previous
        builtLinks.push({
            url: current_page > 1 ? `?page=${current_page - 1}` : null,
            label: 'Previous',
            active: false,
            isPrevious: true,
        });

        // Page numbers
        if (start > 1) {
            builtLinks.push({ url: `?page=1`, label: '1', active: false });
            if (start > 2) {
                builtLinks.push({ url: null, label: '...', active: false });
            }
        }

        for (let i = start; i <= end; i++) {
            builtLinks.push({
                url: `?page=${i}`,
                label: String(i),
                active: i === current_page,
            });
        }

        if (end < last_page) {
            if (end < last_page - 1) {
                builtLinks.push({ url: null, label: '...', active: false });
            }
            builtLinks.push({ url: `?page=${last_page}`, label: String(last_page), active: false });
        }

        // Next
        builtLinks.push({
            url: current_page < last_page ? `?page=${current_page + 1}` : null,
            label: 'Next',
            active: false,
            isNext: true,
        });

        return builtLinks;
    };

    const displayLinks = links && links.length > 0 ? links : buildLinks();

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 ${className}`}>
            {/* Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{' '}
                <span className="font-medium">
                    {total > 0 ? (current_page - 1) * per_page + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                    {Math.min(current_page * per_page, total)}
                </span>{' '}
                of <span className="font-medium">{total}</span> results
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {displayLinks.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={index}
                                className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400"
                            >
                                {link.label}
                            </span>
                        );
                    }

                    // Previous button with icon
                    if (link.isPrevious) {
                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={`
                                    inline-flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors
                                    ${link.active
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                `}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Previous
                            </Link>
                        );
                    }

                    // Next button with icon
                    if (link.isNext) {
                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={`
                                    inline-flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors
                                    ${link.active
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                `}
                            >
                                Next
                                <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        );
                    }

                    // Page number
                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`
                                px-3 py-1 text-sm rounded-md transition-colors
                                ${
                                    link.active
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
