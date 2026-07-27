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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Teacher Name</div>
                    <div className="font-medium text-gray-800">{teacher.name}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Teacher ID</div>
                    <div className="font-medium text-gray-800">{teacher.teacher_id}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned Grades</div>
                    <div className="font-medium text-gray-800">{teacher.grades?.join(', ') || 'None'}</div>
                </div>
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                    <StatusBadge status={teacher.status?.toLowerCase().replace(' ', '_') || 'inactive'} />
                </div>
            </div>

            {/* ===== Activity Summary ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-blue-600">{safeNumber(teacher.total_lessons)}</div>
                    <div className="text-sm font-medium text-gray-500">Total Lessons</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-purple-600">{safeNumber(teacher.total_assignments)}</div>
                    <div className="text-sm font-medium text-gray-500">Total Assignments</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{safeNumber(teacher.total_quizzes)}</div>
                    <div className="text-sm font-medium text-gray-500">Total Quizzes</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-gray-600">{teacher.last_login || 'Never'}</div>
                    <div className="text-sm font-medium text-gray-500">Last Login</div>
                </div>
            </div>
        </div>
    );
}
