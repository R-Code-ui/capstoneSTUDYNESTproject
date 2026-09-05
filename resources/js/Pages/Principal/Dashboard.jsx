import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import { toast } from 'sonner';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Heroicons
import {
    UserGroupIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    DocumentDuplicateIcon,
    MegaphoneIcon,
    UsersIcon,
    EyeIcon,
    CalendarIcon,
    ArrowRightIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

export default function PrincipalDashboard({
    stats,
    teacher_activity,
    student_participation,
    most_active_teacher,
    inactive_teachers_count,
    recent_activities,
    recent_announcements,
    academic_summary
}) {
    const handleNavigationError = () => toast.error('Unable to load that page. Please try again.');

    const shortenChartLabel = (value, maxLength = 12) => {
        const label = String(value || 'Teacher');
        return label.length > maxLength ? `${label.slice(0, maxLength)}…` : label;
    };

    const teacherChartData = (teacher_activity || []).slice(0, 8).map((teacher) => ({
        name: shortenChartLabel(teacher.name?.split(' ')[0], 10),
        Lessons: Number(teacher.lessons_count || 0),
        Assignments: Number(teacher.assignments_count || 0),
        Quizzes: Number(teacher.quizzes_count || 0),
    }));
    const participationChartData = (student_participation || []).map((grade) => ({
        name: grade.grade_level?.replace('Grade ', 'G') || 'Grade',
        Participation: Number(grade.participation_rate || 0),
    }));
    const academicChartData = [
        { name: 'Quiz score', value: Number(academic_summary?.average_quiz_score || 0), color: '#f59e0b' },
        { name: 'Assignments', value: Number(academic_summary?.assignment_completion_rate || 0), color: '#38bdf8' },
        { name: 'Lessons', value: Number(academic_summary?.lesson_completion_rate || 0), color: '#34d399' },
    ];
    const chartTooltipStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', fontSize: 12 };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-gray-800">Principal Dashboard</h2>}
        >
            <Head title="Principal Dashboard" />

            <div className="principal-dashboard min-h-full py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6">
                <style>{`
                    .principal-dashboard { scroll-padding-bottom: max(8rem, env(safe-area-inset-bottom)); background: radial-gradient(circle at 4% 2%, rgb(254 243 199 / 0.65), transparent 22rem), radial-gradient(circle at 96% 14%, rgb(255 237 213 / 0.72), transparent 24rem), #f8fafc; }
                    .principal-dashboard :focus-visible { scroll-margin-block: 1rem 9rem; }
                    .principal-dashboard-hero { position: relative; isolation: isolate; overflow: hidden; background: linear-gradient(118deg, rgb(180 83 9), rgb(202 138 4) 48%, rgb(234 88 12)); box-shadow: 0 18px 38px rgb(180 83 9 / 0.2); }
                    .principal-dashboard-hero::before, .principal-dashboard-hero::after { content: ''; position: absolute; z-index: -1; border-radius: 999px; background: rgb(255 255 255 / 0.14); }
                    .principal-dashboard-hero::before { width: 15rem; height: 15rem; right: -5rem; top: -9rem; }
                    .principal-dashboard-hero::after { width: 9rem; height: 9rem; right: 27%; bottom: -6rem; }
                    .principal-dashboard-card { box-shadow: 0 8px 24px rgb(15 23 42 / 0.05); transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
                    .principal-dashboard-quick-link > svg { width: 2.75rem; height: 2.75rem; padding: 0.65rem; border-radius: 0.9rem; }
                    .principal-dashboard-quick-link:nth-child(1) > svg { color: #b45309; background: #fef3c7; }
                    .principal-dashboard-quick-link:nth-child(2) > svg { color: #047857; background: #d1fae5; }
                    .principal-dashboard-quick-link:nth-child(3) > svg { color: #7e22ce; background: #f3e8ff; }
                    .principal-dashboard-quick-link:nth-child(4) > svg { color: #0369a1; background: #e0f2fe; }
                    .principal-dashboard-quick-link:nth-child(5) > svg { color: #be123c; background: #ffe4e6; }
                    @media (hover: hover) {
                        .principal-dashboard-card:hover { border-color: rgb(253 230 138); box-shadow: 0 16px 32px rgb(120 53 15 / 0.10); }
                    }
                    .studynest-layout.theme-dark .principal-dashboard { background: radial-gradient(circle at 5% 2%, rgb(120 53 15 / 0.14), transparent 23rem), radial-gradient(circle at 96% 14%, rgb(154 52 18 / 0.10), transparent 24rem), rgb(15 23 42); }
                    .studynest-layout.theme-dark .principal-dashboard-card { background-color: rgb(23 32 51) !important; border-color: rgb(43 58 82) !important; box-shadow: 0 10px 24px rgb(2 6 23 / 0.16); }
                    .studynest-layout.theme-dark .principal-dashboard-card > div:first-child { background: linear-gradient(100deg, rgb(27 39 61), rgb(23 32 51)) !important; border-color: rgb(43 58 82) !important; }
                    .studynest-layout.theme-dark .principal-dashboard-card h3,
                    .studynest-layout.theme-dark .principal-dashboard-card .text-gray-800 { color: rgb(241 245 249) !important; }
                    .studynest-layout.theme-dark .principal-dashboard-card .principal-dashboard-item { background-color: rgb(29 41 62) !important; border-color: rgb(43 58 82) !important; }
                    .studynest-layout.theme-dark .principal-dashboard-quick-link { background-color: rgb(29 41 62) !important; border-color: rgb(43 58 82) !important; }
                    .studynest-layout.theme-dark .principal-dashboard-quick-link:nth-child(1) > svg { color: #fbbf24; background: rgb(120 53 15 / 0.32); }
                    .studynest-layout.theme-dark .principal-dashboard-quick-link:nth-child(2) > svg { color: #6ee7b7; background: rgb(6 78 59 / 0.35); }
                    .studynest-layout.theme-dark .principal-dashboard-quick-link:nth-child(3) > svg { color: #d8b4fe; background: rgb(88 28 135 / 0.34); }
                    .studynest-layout.theme-dark .principal-dashboard-quick-link:nth-child(4) > svg { color: #7dd3fc; background: rgb(12 74 110 / 0.34); }
                    .studynest-layout.theme-dark .principal-dashboard-quick-link:nth-child(5) > svg { color: #fda4af; background: rgb(136 19 55 / 0.34); }
                    .studynest-layout.theme-dark .principal-dashboard .recharts-cartesian-grid line { stroke: rgb(71 85 105); }
                    .studynest-layout.theme-dark .principal-dashboard .recharts-text { fill: rgb(148 163 184); }
                `}</style>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="principal-dashboard-hero rounded-3xl p-5 text-white sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><SparklesIcon className="h-3.5 w-3.5" /> School command center</span>
                                <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Welcome back!</h1>
                                <p className="mt-1 text-sm text-amber-50">Review school activity, academic progress, and current updates.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:min-w-64">
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5"><p className="text-xl font-bold">{stats.total_students}</p><p className="text-xs text-amber-50">Students</p></div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5"><p className="text-xl font-bold">{stats.total_teachers}</p><p className="text-xs text-amber-50">Teachers</p></div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 1: School Overview Cards ===== */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                        <div className="principal-dashboard-card rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <UserGroupIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_teachers}</div>
                                    <div className="text-xs font-medium text-gray-500">Teachers</div>
                                </div>
                            </div>
                        </div>

                        <div className="principal-dashboard-card rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_students}</div>
                                    <div className="text-xs font-medium text-gray-500">Students</div>
                                </div>
                            </div>
                        </div>

                        <div className="principal-dashboard-card rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_lessons}</div>
                                    <div className="text-xs font-medium text-gray-500">Lessons</div>
                                </div>
                            </div>
                        </div>

                        <div className="principal-dashboard-card rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-50 rounded-lg">
                                    <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_assignments}</div>
                                    <div className="text-xs font-medium text-gray-500">Assignments</div>
                                </div>
                            </div>
                        </div>

                        <div className="principal-dashboard-card rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_quizzes}</div>
                                    <div className="text-xs font-medium text-gray-500">Quizzes</div>
                                </div>
                            </div>
                        </div>

                        <div className="principal-dashboard-card rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <MegaphoneIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_announcements}</div>
                                    <div className="text-xs font-medium text-gray-500">Announcements</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 2: Analytics ===== */}
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
                        <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700 sm:px-6">
                                <div><h3 className="text-sm font-bold text-gray-900 dark:text-white">Teacher activity</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Lessons, assignments, and quizzes created</p></div>
                                <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div className="h-72 p-4 sm:p-6">
                                {teacherChartData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={teacherChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} /><Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.08)' }} /><Bar dataKey="Lessons" fill="#818cf8" radius={[5, 5, 0, 0]} /><Bar dataKey="Assignments" fill="#38bdf8" radius={[5, 5, 0, 0]} /><Bar dataKey="Quizzes" fill="#34d399" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">No teacher activity data available.</div>}
                            </div>
                        </div>
                        <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700 sm:px-6"><div><h3 className="text-sm font-bold text-gray-900 dark:text-white">Participation by grade</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Active student participation rate</p></div><AcademicCapIcon className="h-5 w-5 text-emerald-500" /></div>
                            <div className="h-72 p-4 sm:p-6">{participationChartData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={participationChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="participationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.35} /><stop offset="95%" stopColor="#34d399" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} /><Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`${value}%`, 'Participation']} /><Area type="monotone" dataKey="Participation" stroke="#10b981" strokeWidth={3} fill="url(#participationFill)" /></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">No participation data available.</div>}</div>
                        </div>
                    </div>

                    {/* ===== Section 3: Teacher Activity Summary ===== */}
                    <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Teacher Activity Summary</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-400/10 rounded-lg border border-amber-200 dark:border-amber-400/20">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Most Active Teacher</span>
                                    <div className="mt-0.5 block max-w-[240px] truncate text-base font-bold text-amber-900 dark:text-amber-100" title={most_active_teacher?.name || 'N/A'}>
                                        {most_active_teacher ? most_active_teacher.name : 'N/A'}
                                    </div>
                                </div>
                                <div className="p-4 bg-rose-50 dark:bg-rose-400/10 rounded-lg border border-rose-200 dark:border-rose-400/20">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">Teachers Without Activity</span>
                                    <div className="text-base font-bold text-rose-600 dark:text-rose-100 mt-0.5">
                                        {inactive_teachers_count}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden overflow-x-auto sm:block">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/60">
                                        <tr>
                                            <th className="px-4 py-3">Teacher</th>
                                            <th className="px-4 py-3 text-center">Lessons</th>
                                            <th className="px-4 py-3 text-center">Assignments</th>
                                            <th className="px-4 py-3 text-center">Quizzes</th>
                                            <th className="px-4 py-3">Last Sign-In</th>
                                            <th className="px-4 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {teacher_activity.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                    No teacher activity data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            teacher_activity.slice(0, 5).map((teacher, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                                                        <span className="block max-w-[180px] truncate" title={teacher.name || ''}>{teacher.name || '—'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{teacher.lessons_count}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{teacher.assignments_count}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{teacher.quizzes_count}</td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                        <span className="block max-w-[180px] truncate" title={teacher.last_activity || ''}>{teacher.last_activity || '—'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <StatusBadge status={teacher.is_active ? 'active' : 'inactive'} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    </table>
                                </div>
                            {teacher_activity.length > 0 && (
                                <div className="space-y-3 sm:hidden">
                                    {teacher_activity.slice(0, 5).map((teacher) => (
                                        <div key={teacher.id} className="principal-dashboard-item rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-gray-700 dark:bg-slate-800">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-gray-900 dark:text-white" title={teacher.name}>{teacher.name || 'â€”'}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Last sign-in: {teacher.last_activity || 'â€”'}</p>
                                                </div>
                                                <StatusBadge status={teacher.is_active ? 'active' : 'inactive'} />
                                            </div>
                                            <div className="mt-3 grid grid-cols-3 divide-x divide-gray-200 text-center dark:divide-gray-700">
                                                <div><p className="text-base font-bold text-gray-900 dark:text-white">{teacher.lessons_count}</p><p className="text-[11px] text-gray-500">Lessons</p></div>
                                                <div><p className="text-base font-bold text-gray-900 dark:text-white">{teacher.assignments_count}</p><p className="text-[11px] text-gray-500">Assignments</p></div>
                                                <div><p className="text-base font-bold text-gray-900 dark:text-white">{teacher.quizzes_count}</p><p className="text-[11px] text-gray-500">Quizzes</p></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===== Section 3: Student Participation & Summary ===== */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Student Participation */}
                        <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Student Participation</h3>
                            </div>
                            <div className="space-y-4 p-4 sm:p-6">
                                {student_participation.map((grade) => (
                                    <div key={grade.grade_level} className="space-y-1">
                                        <div className="flex items-start justify-between gap-3 text-sm">
                                            <span className="font-medium text-gray-700">{grade.grade_level}</span>
                                            <span className="shrink-0 text-gray-500">{grade.active_students} / {grade.total_students} ({grade.participation_rate}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${grade.participation_rate}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Academic Summary */}
                            <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Academic Summary</h3>
                                </div>
                                <div className="space-y-3 p-4 sm:p-6">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Average Quiz Score</span>
                                        <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-md">{academic_summary.average_quiz_score}%</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Assignment Completion Rate</span>
                                        <span className="text-sm font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-md">{academic_summary.assignment_completion_rate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Lesson Completion Rate</span>
                                        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">{academic_summary.lesson_completion_rate}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Announcements */}
                            <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700">Recent Announcements</h3>
                                    <Link href={route('principal.announcements.index')} onError={handleNavigationError} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                        View All <ArrowRightIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="space-y-3 p-4 sm:p-6">
                                    {recent_announcements.length === 0 ? (
                                        <p className="text-sm text-gray-500">No recent announcements.</p>
                                    ) : (
                                        recent_announcements.map((announcement, index) => (
                                                <div key={index} className="principal-dashboard-item rounded-xl border border-gray-100 bg-gray-50 p-3 last:pb-3 dark:border-gray-700 dark:bg-slate-800">
                                                <div className="block max-w-[260px] truncate text-sm font-medium text-gray-800" title={announcement.title || ''}>{announcement.title || '—'}</div>
                                                <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:justify-between">
                                                    <span className="max-w-[150px] truncate" title={announcement.posted_by || ''}>By {announcement.posted_by || '—'}</span>
                                                    <span className="shrink-0">{announcement.date}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 4: Recent Activities ===== */}
                    <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Recent Teacher Activities</h3>
                        </div>
                        <div className="space-y-2 p-4 sm:p-6">
                            {recent_activities.length === 0 ? (
                                <p className="text-sm text-gray-500">No recent activities.</p>
                            ) : (
                                recent_activities.map((activity, index) => (
                                    <div key={index} className="principal-dashboard-item flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0 text-gray-600" title={`${activity.teacher || ''} ${activity.action || ''}`}>
                                            <span className="font-medium text-gray-800">{activity.teacher || '—'}</span>
                                            <span className="text-gray-500"> {activity.action || ''}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 sm:ml-2 sm:shrink-0">{activity.date}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ===== Section 5: Quick Navigation ===== */}
                    <div className="principal-dashboard-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Quick Navigation</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <Link
                                    href={route('principal.users.index')}
                                    onError={handleNavigationError}
                                    className="principal-dashboard-quick-link group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700/60 sm:min-h-0 sm:p-4"
                                >
                                    <UserGroupIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-amber-600" />
                                    <span className="text-xs font-medium text-center">Manage Users</span>
                                </Link>

                                <Link
                                    href={route('principal.teachers.index')}
                                    onError={handleNavigationError}
                                    className="principal-dashboard-quick-link group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700/60 sm:min-h-0 sm:p-4"
                                >
                                    <UsersIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-emerald-600" />
                                    <span className="text-xs font-medium text-center">Teacher Monitoring</span>
                                </Link>

                                <Link
                                    href={route('principal.announcements.index')}
                                    onError={handleNavigationError}
                                    className="principal-dashboard-quick-link group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700/60 sm:min-h-0 sm:p-4"
                                >
                                    <MegaphoneIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-purple-600" />
                                    <span className="text-xs font-medium text-center">Announcements</span>
                                </Link>

                                <Link
                                    href={route('principal.reports.index')}
                                    onError={handleNavigationError}
                                    className="principal-dashboard-quick-link group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-slate-100 hover:text-sky-700 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700/60 sm:min-h-0 sm:p-4"
                                >
                                    <DocumentDuplicateIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-sky-600" />
                                    <span className="text-xs font-medium text-center">Reports</span>
                                </Link>

                                <Link
                                    href={route('principal.logs.index')}
                                    onError={handleNavigationError}
                                    className="principal-dashboard-quick-link group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700/60 sm:min-h-0 sm:p-4"
                                >
                                    <EyeIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-rose-600" />
                                    <span className="text-xs font-medium text-center">Activity Logs</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
