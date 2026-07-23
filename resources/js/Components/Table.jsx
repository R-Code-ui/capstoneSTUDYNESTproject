import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

// ===== PAGINATION COMPONENT =====
function PaginationControls({ pagination }) {
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

    // Build links manually if not provided
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

        builtLinks.push({
            url: current_page > 1 ? `?page=${current_page - 1}` : null,
            label: 'Previous',
            active: false,
            isPrevious: true,
        });

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

        builtLinks.push({
            url: current_page < last_page ? `?page=${current_page + 1}` : null,
            label: 'Next',
            active: false,
            isNext: true,
        });

        return builtLinks;
    };

    const displayLinks = links && links.length > 0 ? links : buildLinks();

    const from = total > 0 ? (current_page - 1) * per_page + 1 : 0;
    const to = Math.min(current_page * per_page, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            {/* Info */}
            <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium text-gray-800">
                    {from}
                </span>{' '}
                to{' '}
                <span className="font-medium text-gray-800">
                    {to}
                </span>{' '}
                of{' '}
                <span className="font-medium text-gray-800">
                    {total}
                </span>{' '}
                results
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {displayLinks.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={index}
                                className="px-3 py-1.5 text-sm text-gray-400"
                            >
                                {link.label}
                            </span>
                        );
                    }

                    if (link.isPrevious) {
                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Previous
                            </Link>
                        );
                    }

                    if (link.isNext) {
                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Next
                                <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors min-w-[36px] text-center
                                ${
                                    link.active
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
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

// ===== TABLE COMPONENT =====
export default function Table({
    headers = [],
    rows = [],
    columns = [],
    actions = [],
    onRowClick,
    className = '',
    tableClassName = '',
    headerClassName = '',
    rowClassName = '',
    emptyMessage = 'No records found.',
    loading = false,
    striped = false,
    hoverable = true,
    bordered = false,
    compact = false,
    renderCell,
    pagination = null,
}) {
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDirection('asc');
        }
    };

    const sortedRows = [...rows];
    if (sortBy && renderCell) {
        sortedRows.sort((a, b) => {
            const aValue = renderCell(a, sortBy)?.props?.children || renderCell(a, sortBy) || '';
            const bValue = renderCell(b, sortBy)?.props?.children || renderCell(b, sortBy) || '';
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return 0;
        });
    }

    const getCellValue = (row, column) => {
        if (typeof column === 'string') {
            return row[column] || '';
        }
        if (typeof column === 'object' && column.key) {
            return row[column.key] || '';
        }
        return '';
    };

    const getCellDisplay = (row, column) => {
        if (typeof column === 'object' && column.render) {
            return column.render(row);
        }
        return getCellValue(row, column);
    };

    const getHeaderLabel = (column) => {
        if (typeof column === 'string') {
            return column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ');
        }
        if (typeof column === 'object' && column.label) {
            return column.label;
        }
        return column.key || '';
    };

    const getHeaderKey = (column) => {
        if (typeof column === 'string') {
            return column;
        }
        if (typeof column === 'object' && column.key) {
            return column.key;
        }
        return column;
    };

    const isSortable = (column) => {
        if (typeof column === 'object' && column.sortable === false) {
            return false;
        }
        return true;
    };

    const displayColumns = columns.length > 0 ? columns : headers;

    const getRowActions = (row) => {
        if (typeof actions === 'function') {
            return actions(row);
        }
        return actions;
    };

    const hasActions = () => {
        if (typeof actions === 'function') {
            const sampleRow = rows.length > 0 ? rows[0] : {};
            return actions(sampleRow).length > 0;
        }
        return actions.length > 0;
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className={`w-full text-sm text-left text-gray-600 ${tableClassName}`}>
                <thead className={`text-xs font-semibold text-gray-500 uppercase bg-gray-50 ${headerClassName}`}>
                    <tr>
                        {displayColumns.map((column, index) => {
                            const key = getHeaderKey(column);
                            const label = getHeaderLabel(column);
                            const sortable = isSortable(column);

                            return (
                                <th
                                    key={index}
                                    className={`px-4 py-3 ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''} ${
                                        compact ? 'px-3 py-2' : ''
                                    }`}
                                    onClick={() => sortable && handleSort(key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {label}
                                        {sortable && sortBy === key && (
                                            <span className="text-gray-400">
                                                {sortDirection === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                        {hasActions() && (
                            <th className={`px-4 py-3 text-right ${compact ? 'px-3 py-2' : ''}`}>
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={displayColumns.length + (hasActions() ? 1 : 0)}
                                className="px-4 py-12 text-center"
                            >
                                <div className="flex justify-center items-center">
                                    <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="ml-2 text-gray-500">Loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : sortedRows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={displayColumns.length + (hasActions() ? 1 : 0)}
                                className="px-4 py-12 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedRows.map((row, rowIndex) => {
                            const rowActions = getRowActions(row);
                            return (
                                <tr
                                    key={rowIndex}
                                    className={`
                                        ${hoverable ? 'hover:bg-gray-50' : ''}
                                        ${striped && rowIndex % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}
                                        ${bordered ? 'border-b border-gray-200' : ''}
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                        ${rowClassName}
                                    `}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {displayColumns.map((column, colIndex) => {
                                        const display = renderCell
                                            ? renderCell(row, column)
                                            : getCellDisplay(row, column);

                                        return (
                                            <td
                                                key={colIndex}
                                                className={`px-4 py-3 ${compact ? 'px-3 py-2' : ''}`}
                                            >
                                                {display}
                                            </td>
                                        );
                                    })}
                                    {rowActions.length > 0 && (
                                        <td className={`px-4 py-3 text-right ${compact ? 'px-3 py-2' : ''}`}>
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {rowActions.map((action, actionIndex) => (
                                                    <button
                                                        key={actionIndex}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            action.onClick(row);
                                                        }}
                                                        className={`
                                                            inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors
                                                            ${action.color === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}
                                                            ${action.color === 'success' ? 'text-emerald-600 hover:bg-emerald-50' : ''}
                                                            ${action.color === 'warning' ? 'text-amber-600 hover:bg-amber-50' : ''}
                                                            ${(!action.color || action.color === 'primary') ? 'text-gray-600 hover:bg-gray-100' : ''}
                                                            ${action.className || ''}
                                                        `}
                                                        title={action.label}
                                                    >
                                                        {action.icon ? (
                                                            <span className="inline-flex items-center gap-1">
                                                                {action.icon}
                                                                {action.label}
                                                            </span>
                                                        ) : (
                                                            action.label
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination && <PaginationControls pagination={pagination} />}
        </div>
    );
}

// ===== STATUS BADGE HELPER =====
export function StatusBadge({ status }) {
    const variants = {
        active: 'bg-emerald-100 text-emerald-800',
        published: 'bg-emerald-100 text-emerald-800',
        draft: 'bg-amber-100 text-amber-800',
        archived: 'bg-gray-100 text-gray-800',
        pending: 'bg-amber-100 text-amber-800',
        submitted: 'bg-sky-100 text-sky-800',
        graded: 'bg-emerald-100 text-emerald-800',
        incomplete: 'bg-rose-100 text-rose-800',
        normal: 'bg-sky-100 text-sky-800',
        important: 'bg-amber-100 text-amber-800',
        urgent: 'bg-rose-100 text-rose-800',
        unread: 'bg-sky-100 text-sky-800',
        read: 'bg-gray-100 text-gray-800',
        replied: 'bg-emerald-100 text-emerald-800',
        not_started: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-amber-100 text-amber-800',
        completed: 'bg-emerald-100 text-emerald-800',
        failed: 'bg-rose-100 text-rose-800',
        passed: 'bg-emerald-100 text-emerald-800',
        started: 'bg-amber-100 text-amber-800',
        excellent: 'bg-emerald-100 text-emerald-800',
        needs_monitoring: 'bg-amber-100 text-amber-800',
        needs_support: 'bg-rose-100 text-rose-800',
        inactive: 'bg-gray-200 text-gray-700',
    };

    const label = status?.toString().replace(/_/g, ' ').toUpperCase() || '';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-800'}`}>
            {label}
        </span>
    );
}
