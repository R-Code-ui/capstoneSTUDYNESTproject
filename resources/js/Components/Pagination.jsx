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

    const getLinkLabel = (link) =>
        String(link.label || '')
            .replace(/&laquo;|«/g, '')
            .replace(/&raquo;|»/g, '')
            .trim();

    return (
        <div className={`mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 ${className}`}>
            {/* Info */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {total > 0 ? (current_page - 1) * per_page + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {Math.min(current_page * per_page, total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {total}
                </span>{' '}
                results
            </div>

            {/* Controls */}
            <nav aria-label="Pagination" className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-800/60">
                {displayLinks.map((link, index) => {
                    const label = getLinkLabel(link);
                    const isPrevious = link.isPrevious || /previous/i.test(label);
                    const isNext = link.isNext || /^next$/i.test(label);

                    if (link.url === null) {
                        return (
                            <span
                                key={index}
                                className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500"
                            >
                                {label}
                            </span>
                        );
                    }

                    // Previous button with icon
                    if (isPrevious) {
                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Previous
                            </Link>
                        );
                    }

                    // Next button with icon
                    if (isNext) {
                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
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
                                min-w-[36px] rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors
                                ${
                                    link.active
                                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                                        : 'text-slate-600 hover:bg-white hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-300'
                                }
                            `}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
