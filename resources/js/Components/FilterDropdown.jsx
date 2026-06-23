import { useState, useRef, useEffect } from 'react';

export default function FilterDropdown({
    options = [],
    value = '',
    onChange,
    placeholder = 'Filter...',
    label = '',
    className = '',
    buttonClassName = '',
    dropdownClassName = '',
    optionClassName = '',
    icon = null,
    disabled = false,
    showClear = true,
    clearLabel = 'Clear filter',
    size = 'md', // sm, md, lg
    variant = 'default', // default, bordered, outline
    searchable = false,
    searchPlaceholder = 'Search options...',
    multiSelect = false,
    selectedValues = [],
    onMultiSelectChange,
    onClear,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current?.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on Escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base',
    };

    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        bordered: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        outline: 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
    };

    const getDisplayValue = () => {
        if (multiSelect) {
            if (selectedValues.length === 0) return placeholder;
            const selectedOptions = options.filter((opt) =>
                selectedValues.includes(opt.value)
            );
            return selectedOptions.map((opt) => opt.label).join(', ');
        }

        if (!value) return placeholder;
        const selected = options.find((opt) => opt.value === value);
        return selected ? selected.label : placeholder;
    };

    const handleSelect = (option) => {
        if (disabled) return;

        if (multiSelect) {
            const newValues = selectedValues.includes(option.value)
                ? selectedValues.filter((v) => v !== option.value)
                : [...selectedValues, option.value];

            if (onMultiSelectChange) {
                onMultiSelectChange(newValues);
            }
            if (onChange) {
                onChange(newValues);
            }
            return;
        }

        if (onChange) {
            onChange(option.value);
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        if (multiSelect) {
            if (onMultiSelectChange) onMultiSelectChange([]);
            if (onChange) onChange([]);
        } else {
            if (onChange) onChange('');
        }
        if (onClear) onClear();
        setIsOpen(false);
    };

    const filteredOptions = searchable
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : options;

    const iconSize = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Label */}
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            {/* Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    inline-flex items-center justify-between
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                    ${roundedClasses['md']}
                    text-gray-700 dark:text-gray-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    transition duration-200
                    min-w-[150px] w-full
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${buttonClassName}
                `}
            >
                <span className="truncate text-left">
                    {getDisplayValue()}
                </span>
                <span className="ml-2 flex-shrink-0">
                    {icon || (
                        <svg
                            className={`${iconSize[size]} text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    )}
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    className={`
                        absolute z-50 mt-1
                        min-w-full w-max max-w-md
                        bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        rounded-lg shadow-lg
                        overflow-hidden
                        ${dropdownClassName}
                    `}
                >
                    {/* Search input (if searchable) */}
                    {searchable && (
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-gray-200"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    {/* Options */}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {showClear && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                            >
                                {clearLabel}
                            </button>
                        )}

                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = multiSelect
                                    ? selectedValues.includes(option.value)
                                    : value === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-4 py-2 text-left text-sm
                                            flex items-center justify-between
                                            ${isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }
                                            transition-colors
                                            ${optionClassName}
                                        `}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && (
                                            <svg
                                                className="h-4 w-4 text-blue-500 dark:text-blue-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper: Option badge count display
export function FilterBadge({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
            {label}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            )}
        </span>
    );
}

// Helper: rounded classes
const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
};
