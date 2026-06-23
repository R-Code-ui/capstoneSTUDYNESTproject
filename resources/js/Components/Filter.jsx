import { useState } from 'react';
import FilterDropdown from './FilterDropdown';

export default function Filter({
    filters = [],
    onApply = () => {},
    onReset = () => {},
    className = '',
    showReset = true,
    resetLabel = 'Reset Filters',
    applyLabel = 'Apply Filters',
    compact = false,
}) {
    const [filterValues, setFilterValues] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    // Initialize filter values
    useState(() => {
        const initialValues = {};
        filters.forEach((filter) => {
            initialValues[filter.key] = filter.defaultValue || '';
        });
        setFilterValues(initialValues);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Count active filters (non-empty values)
        const count = Object.values({
            ...filterValues,
            [key]: value,
        }).filter((v) => v !== '' && v !== null && v !== undefined).length;
        setActiveFilterCount(count);
    };

    const handleApply = () => {
        const activeFilters = {};
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                activeFilters[key] = value;
            }
        });
        onApply(activeFilters);
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetValues = {};
        filters.forEach((filter) => {
            resetValues[filter.key] = filter.defaultValue || '';
        });
        setFilterValues(resetValues);
        setActiveFilterCount(0);
        onReset();
        setIsOpen(false);
    };

    const renderFilterInput = (filter) => {
        const value = filterValues[filter.key] || '';

        switch (filter.type) {
            case 'select':
                return (
                    <FilterDropdown
                        key={filter.key}
                        options={filter.options || []}
                        value={value}
                        onChange={(val) => handleFilterChange(filter.key, val)}
                        placeholder={filter.placeholder || 'Select...'}
                        label={filter.label}
                        size="sm"
                        fullWidth
                    />
                );

            case 'text':
                return (
                    <div key={filter.key} className="w-full">
                        {filter.label && (
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {filter.label}
                            </label>
                        )}
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            placeholder={filter.placeholder || 'Enter value...'}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200"
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={filter.key} className="w-full">
                        {filter.label && (
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {filter.label}
                            </label>
                        )}
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            placeholder={filter.placeholder || 'Enter number...'}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200"
                            min={filter.min}
                            max={filter.max}
                        />
                    </div>
                );

            case 'date':
                return (
                    <div key={filter.key} className="w-full">
                        {filter.label && (
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {filter.label}
                            </label>
                        )}
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200"
                            min={filter.min}
                            max={filter.max}
                        />
                    </div>
                );

            case 'range':
                return (
                    <div key={filter.key} className="w-full">
                        {filter.label && (
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {filter.label}
                            </label>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={value.from || ''}
                                onChange={(e) => handleFilterChange(filter.key, {
                                    ...value,
                                    from: e.target.value,
                                })}
                                placeholder="From"
                                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200"
                            />
                            <span className="text-gray-500 dark:text-gray-400">to</span>
                            <input
                                type="number"
                                value={value.to || ''}
                                onChange={(e) => handleFilterChange(filter.key, {
                                    ...value,
                                    to: e.target.value,
                                })}
                                placeholder="To"
                                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200"
                            />
                        </div>
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={filter.key} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {filter.label && (
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                                {filter.label}
                            </label>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (compact) {
        return (
            <div className={`relative inline-block ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4">
                        <div className="space-y-4">
                            {filters.map((filter) => renderFilterInput(filter))}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {showReset && (
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {resetLabel}
                                </button>
                            )}
                            <button
                                onClick={handleApply}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                {applyLabel}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filters.map((filter) => renderFilterInput(filter))}
            </div>
            <div className="flex justify-end gap-2">
                {showReset && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {resetLabel}
                    </button>
                )}
                <button
                    onClick={handleApply}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    {applyLabel}
                </button>
            </div>
        </div>
    );
}
