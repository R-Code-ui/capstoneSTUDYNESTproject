import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function AudienceSelector({
    value = '',
    onChange,
    options = [],
    label = 'Target Audience',
    required = false,
    error = null,
    className = '',
    disabled = false,
    placeholder = 'Select Audience',
}) {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className={className}>
            {label && <InputLabel value={label} required={required} />}
            <select
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 ${
                    error ? 'border-red-500 dark:border-red-400' : ''
                }`}
                required={required}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}
