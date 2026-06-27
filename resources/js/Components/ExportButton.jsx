import { useState, useRef, useEffect } from 'react';

export default function ExportButton({
    onExport,
    label = 'Download PDF',
    className = '',
    disabled = false,
}) {
    const handleClick = () => {
        if (onExport) {
            onExport('pdf');
        }
    };

    const ExportIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    return (
        <div className={`inline-block ${className}`}>
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`
                    inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-colors
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <ExportIcon />
                {label}
            </button>
        </div>
    );
}
