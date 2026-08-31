import { useCallback, useEffect, useMemo, useState } from 'react';

const lateSubmissionIsAllowed = (value) => value === true || value === 1 || value === '1';

export function resolveDeadlineStatus(record, currentTime = Date.now()) {
    if (!record) return 'open';

    const deadline = Date.parse(record.due_at || '');
    if (!Number.isFinite(deadline)) {
        return record.deadline_status || 'open';
    }

    if (currentTime <= deadline) return 'open';

    return lateSubmissionIsAllowed(record.allow_late_submission)
        ? 'late_submission_allowed'
        : 'expired';
}

export default function useDeadlineStatuses(records) {
    const normalizedRecords = Array.isArray(records) ? records : records ? [records] : [];
    const deadlineKey = useMemo(
        () => normalizedRecords
            .map((record) => `${record?.id ?? ''}:${record?.due_at ?? ''}:${record?.allow_late_submission ?? ''}`)
            .join('|'),
        [records],
    );
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const updateClock = () => setCurrentTime(Date.now());
        const now = Date.now();
        const futureDeadlines = normalizedRecords
            .map((record) => Date.parse(record?.due_at || ''))
            .filter((deadline) => Number.isFinite(deadline) && deadline >= now);
        const nextDeadline = futureDeadlines.length > 0 ? Math.min(...futureDeadlines) : null;
        const timeoutId = nextDeadline === null
            ? null
            : window.setTimeout(updateClock, Math.max(25, nextDeadline - now + 25));

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') updateClock();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', updateClock);

        return () => {
            if (timeoutId !== null) window.clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', updateClock);
        };
    }, [deadlineKey, currentTime]);

    return useCallback(
        (record) => resolveDeadlineStatus(record, currentTime),
        [currentTime],
    );
}
