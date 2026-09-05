import StatusBadge from '@/Components/StatusBadge';

export default function TeacherProfile({ teacher }) {
    // Helper: Ensure numeric values show 0 if null/undefined
    const safeNumber = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        return value;
    };

    return (
        <div className="space-y-6">
            {/* ===== Basic Information ===== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Teacher Name</div>
                    <div className="truncate font-medium text-gray-800" title={teacher.name || ''}>{teacher.name || '—'}</div>
                </div>
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Teacher ID</div>
                    <div className="truncate font-medium text-gray-800" title={teacher.teacher_id || ''}>{teacher.teacher_id || '—'}</div>
                </div>
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned Grades</div>
                    <div className="truncate font-medium text-gray-800" title={teacher.grades?.join(', ') || 'None'}>{teacher.grades?.join(', ') || 'None'}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                    <StatusBadge status={teacher.status?.toLowerCase().replace(' ', '_') || 'inactive'} />
                </div>
            </div>

            {/* ===== Activity Summary ===== */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{safeNumber(teacher.total_lessons)}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Lessons</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{safeNumber(teacher.total_assignments)}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Assignments</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{safeNumber(teacher.total_quizzes)}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Quizzes</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-2xl font-bold text-gray-600 dark:text-slate-300">{teacher.last_login || 'Never'}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Last Login</div>
                </div>
            </div>
        </div>
    );
}
