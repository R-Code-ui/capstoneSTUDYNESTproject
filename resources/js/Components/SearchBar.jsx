import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/Hooks/useDebounce';

export default function SearchBar({
    value = '',
    onChange,
    onSearch,
    placeholder = 'Search...',
    className = '',
    inputClassName = '',
    iconClassName = '',
    clearable = true,
    debounceDelay = 300,
    size = 'md', // sm, md, lg
    rounded = 'md',
    fullWidth = true,
    autoFocus = false,
}) {
    const [searchValue, setSearchValue] = useState(value);
    const debouncedValue = useDebounce(searchValue, debounceDelay);
    const inputRef = useRef(null);

    // Handle debounced search
    useEffect(() => {
        if (onSearch) {
            onSearch(debouncedValue);
        }
        if (onChange) {
            onChange(debouncedValue);
        }
    }, [debouncedValue]);

    // Sync external value changes
    useEffect(() => {
        if (value !== searchValue) {
            setSearchValue(value);
        }
    }, [value]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
    };

    const handleClear = () => {
        setSearchValue('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
        if (onSearch) {
            onSearch('');
        }
        if (onChange) {
            onChange('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchValue);
        }
        if (onChange) {
            onChange(searchValue);
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3.5 text-base',
    };

    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
        <form
            onSubmit={handleSubmit}
            className={`relative ${widthClasses} ${className}`}
        >
            <div className="relative">
                {/* Search Icon */}
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                        className={`${iconSizeClasses[size]} text-gray-400 dark:text-gray-500 ${iconClassName}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`
                        block ${widthClasses} ${sizeClasses[size]}
                        pl-10 pr-10
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        border border-gray-300 dark:border-gray-600
                        focus:border-blue-500 dark:focus:border-blue-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                        ${roundedClasses[rounded]}
                        transition duration-200
                        ${inputClassName}
                    `}
                />

                {/* Clear Button */}
                {clearable && searchValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        aria-label="Clear search"
                    >
                        <svg
                            className={`${iconSizeClasses[size]}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}

                {/* Search Button (mobile friendly) */}
                <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors sm:hidden"
                    aria-label="Search"
                >
                    <svg
                        className={`${iconSizeClasses[size]}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </button>
            </div>

            {/* Keyboard shortcut hint (optional) */}
            {searchValue && (
                <div className="absolute right-14 top-1/2 hidden -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 sm:block">
                    <kbd className="rounded border border-gray-300 px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600">
                        Esc
                    </kbd>
                </div>
            )}
        </form>
    );
}
