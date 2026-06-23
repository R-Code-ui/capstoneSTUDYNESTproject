import { useState } from 'react';
import { Link } from '@inertiajs/react';

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

    // Sort rows if sortBy is set
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

    // Determine which columns to use
    const displayColumns = columns.length > 0 ? columns : headers;

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className={`w-full text-sm text-left text-gray-500 dark:text-gray-400 ${tableClassName}`}>
                <thead className={`text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ${headerClassName}`}>
                    <tr>
                        {displayColumns.map((column, index) => {
                            const key = getHeaderKey(column);
                            const label = getHeaderLabel(column);
                            const sortable = isSortable(column);

                            return (
                                <th
                                    key={index}
                                    className={`px-6 py-3 ${sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''} ${
                                        compact ? 'px-4 py-2' : ''
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
                        {actions.length > 0 && (
                            <th className={`px-6 py-3 text-right ${compact ? 'px-4 py-2' : ''}`}>
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={displayColumns.length + (actions.length > 0 ? 1 : 0)}
                                className="px-6 py-12 text-center"
                            >
                                <div className="flex justify-center items-center">
                                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                colSpan={displayColumns.length + (actions.length > 0 ? 1 : 0)}
                                className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedRows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`
                                    ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                                    ${striped && rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}
                                    ${bordered ? 'border-b border-gray-200 dark:border-gray-700' : ''}
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
                                            className={`px-6 py-4 ${compact ? 'px-4 py-2' : ''}`}
                                        >
                                            {display}
                                        </td>
                                    );
                                })}
                                {actions.length > 0 && (
                                    <td className={`px-6 py-4 text-right ${compact ? 'px-4 py-2' : ''}`}>
                                        <div className="flex justify-end gap-2">
                                            {actions.map((action, actionIndex) => (
                                                <button
                                                    key={actionIndex}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        action.onClick(row);
                                                    }}
                                                    className={`
                                                        text-sm font-medium
                                                        ${action.color === 'danger' ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : ''}
                                                        ${action.color === 'success' ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' : ''}
                                                        ${action.color === 'warning' ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300' : ''}
                                                        ${(!action.color || action.color === 'primary') ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' : ''}
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
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// Helper: Status Badge component for use in table cells
export function StatusBadge({ status }) {
    const variants = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        graded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        incomplete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        important: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        unread: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        read: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        replied: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        passed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        started: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        excellent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'needs_monitoring': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'needs_support': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    const label = status?.toString().replace(/_/g, ' ').toUpperCase() || '';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
            {label}
        </span>
    );
}
