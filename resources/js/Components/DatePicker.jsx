import { useState, useRef, useEffect } from 'react';

export default function DatePicker({
    value = '',
    onChange,
    label = '',
    placeholder = 'Select date',
    className = '',
    inputClassName = '',
    disabled = false,
    required = false,
    min = null,
    max = null,
    format = 'YYYY-MM-DD',
    showTime = false,
    clearable = true,
    size = 'md', // sm, md, lg
    variant = 'default', // default, bordered, outline
    autoFocus = false,
    error = '',
    helper = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value);
    const [viewDate, setViewDate] = useState(new Date());
    const [inputValue, setInputValue] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const buttonRef = useRef(null);

    // Initialize date
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date)) {
                setSelectedDate(value);
                setViewDate(date);
                setInputValue(formatDate(date));
            }
        }
    }, [value]);

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

    // Close on Escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    const formatDate = (date) => {
        if (!date || isNaN(date)) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date) => {
        if (!date || isNaN(date)) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleDateSelect = (date) => {
        const formatted = formatDate(date);
        setSelectedDate(formatted);
        setInputValue(formatDisplayDate(date));
        if (onChange) onChange(formatted);
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedDate('');
        setInputValue('');
        if (onChange) onChange('');
        setIsOpen(false);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        // Try to parse date
        const parsed = new Date(val);
        if (!isNaN(parsed)) {
            const formatted = formatDate(parsed);
            setSelectedDate(formatted);
            setViewDate(parsed);
            if (onChange) onChange(formatted);
        }
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        // Empty cells for first day offset
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDate && date.toDateString() === new Date(selectedDate).toDateString();

            // Check min/max
            let isDisabled = false;
            if (min && date < new Date(min)) isDisabled = true;
            if (max && date > new Date(max)) isDisabled = true;

            days.push(
                <button
                    key={i}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    className={`
                        w-10 h-10 rounded-lg text-sm font-medium
                        transition-colors duration-200
                        ${isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : isToday
                                ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        ${isDisabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer'
                        }
                        ${!isSelected && !isToday ? 'text-gray-700 dark:text-gray-200' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            const today = new Date();
                            handleDateSelect(today);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Today
                    </button>
                    {clearable && selectedDate && (
                        <button
                            onClick={handleClear}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3.5 text-base',
    };

    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400',
        bordered: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400',
        outline: 'bg-transparent border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400',
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    className={`
                        block w-full ${sizeClasses[size]}
                        ${variantClasses[variant]}
                        rounded-md
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                        transition duration-200
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${error ? 'border-red-500 dark:border-red-400 focus:border-red-500' : ''}
                        ${inputClassName}
                    `}
                    readOnly
                />

                {/* Calendar button */}
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="absolute right-0 inset-y-0 px-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {/* Error/Helper text */}
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {helper && !error && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
            )}

            {/* Calendar Dropdown */}
            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-80"
                >
                    {renderCalendar()}
                </div>
            )}
        </div>
    );
}
