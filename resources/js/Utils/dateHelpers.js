/**
 * Format a date string or Date object to a readable format like "Jun 26, 2026"
 */
export function formatDate(date) {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format a date string or Date object to YYYY-MM-DD for input type="date"
 */
export function formatDateInput(date) {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0];
}
