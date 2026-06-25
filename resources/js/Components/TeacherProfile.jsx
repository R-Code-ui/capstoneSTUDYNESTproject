import StatusBadge from '@/Components/StatusBadge';

export default function TeacherProfile({ teacher }) {
    return (
        <div className="space-y-6">
            {/* ===== Basic Information ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Teacher Name</div>
                    <div className="font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Teacher ID</div>
                    <div className="font-medium text-gray-900 dark:text-white">{teacher.teacher_id}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Assigned Grades</div>
                    <div className="font-medium text-gray-900 dark:text-white">{teacher.grades?.join(', ') || 'None'}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    {/* ✅ CHANGED: Use calculated 'status' instead of 'is_active' */}
                    <StatusBadge status={teacher.status?.toLowerCase().replace(' ', '_') || 'inactive'} />
                </div>
            </div>

            {/* ===== Activity Summary ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teacher.total_lessons}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{teacher.total_assignments}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Assignments</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{teacher.total_quizzes}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Quizzes</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{teacher.last_login || 'Never'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Last Login</div>
                </div>
            </div>
        </div>
    );
}
