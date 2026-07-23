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
    size = 'md',
    variant = 'default',
    searchable = false,
    searchPlaceholder = 'Search options...',
    multiSelect = false,
    selectedValues = [],
    onMultiSelectChange,
    onClear,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [placement, setPlacement] = useState('bottom'); // 'bottom' or 'top'
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isOpen) setIsOpen(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Calculate placement when dropdown opens or window resizes
    useEffect(() => {
        if (!isOpen) return;

        const calculatePlacement = () => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // Estimate dropdown height (adjust if your content is taller)
            const dropdownHeight = 250;
            const spaceAbove = rect.top;

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setPlacement('top');
            } else {
                setPlacement('bottom');
            }
        };

        calculatePlacement();
        window.addEventListener('resize', calculatePlacement);
        window.addEventListener('scroll', calculatePlacement);

        return () => {
            window.removeEventListener('resize', calculatePlacement);
            window.removeEventListener('scroll', calculatePlacement);
        };
    }, [isOpen]);

    // Size & variant classes
    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base',
    };

    const variantClasses = {
        default: 'bg-white border border-gray-300 hover:border-gray-400',
        bordered: 'bg-transparent border-2 border-gray-300 hover:border-gray-400',
        outline: 'bg-transparent border border-gray-300 hover:bg-gray-50',
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
            if (onMultiSelectChange) onMultiSelectChange(newValues);
            if (onChange) onChange(newValues);
            return;
        }
        if (onChange) onChange(option.value);
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

    // Placement classes
    const placementClasses = {
        bottom: 'top-full mt-1',
        top: 'bottom-full mb-1',
    };

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <button
                ref={buttonRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    inline-flex items-center justify-between
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                    rounded-md
                    text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-600/20
                    transition duration-200
                    min-w-[150px] w-full
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${buttonClassName}
                `}
            >
                <span className="truncate text-left">{getDisplayValue()}</span>
                <span className="ml-2 flex-shrink-0">
                    {icon || (
                        <svg
                            className={`${iconSize[size]} text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </span>
            </button>

            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    className={`
                        absolute z-50
                        min-w-full w-max max-w-md
                        bg-white
                        border border-gray-200
                        rounded-lg shadow-lg
                        overflow-hidden
                        ${placementClasses[placement]}
                        ${dropdownClassName}
                    `}
                >
                    {searchable && (
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-gray-800"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto py-1">
                        {showClear && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                {clearLabel}
                            </button>
                        )}

                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">No options found</div>
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
                                                ? 'bg-gray-50 text-gray-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                                            transition-colors
                                            ${optionClassName}
                                        `}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && (
                                            <svg
                                                className="h-4 w-4 text-blue-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
