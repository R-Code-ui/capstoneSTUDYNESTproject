import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import { toast } from 'sonner';

import {
    ChartBarIcon,
    ClockIcon,
    DocumentTextIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Soft gradient combinations for cards
const GRADIENT_COLORS = [
    { from: 'from-blue-100', to: 'to-pink-100' },
    { from: 'from-orange-100', to: 'to-yellow-100' },
    { from: 'from-purple-100', to: 'to-pink-100' },
    { from: 'from-emerald-100', to: 'to-blue-100' },
    { from: 'from-yellow-100', to: 'to-rose-100' },
    { from: 'from-indigo-100', to: 'to-purple-100' },
    { from: 'from-teal-100', to: 'to-emerald-100' },
    { from: 'from-rose-100', to: 'to-orange-100' },
    { from: 'from-cyan-100', to: 'to-blue-100' },
    { from: 'from-amber-100', to: 'to-yellow-100' },
];

export default function QuizzesIndex({
    quizzes,
    subjects,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [subjectFilter, setSubjectFilter] = useState(filters?.subject || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        if (type === 'subject') setSubjectFilter(value);
        if (type === 'status') setStatusFilter(value);

        applyFilters({
            ...(type === 'subject' ? { subject: value } : {}),
            ...(type === 'status' ? { status: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('student.quizzes.index'), {
            data: {
                search,
                subject: subjectFilter,
                status: statusFilter,
                ...additional,
            },
            preserveState: true,
            onError: () => toast.error('Unable to load quizzes. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const subjectOptions = [
        { value: '', label: 'All Subjects' },
        ...subjects.map((subject) => ({ value: subject, label: subject })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
    ];

    const getTypeLabel = (type) => {
        const labels = {
            multiple_choice: 'Multiple Choice',
            identification: 'Identification',
            true_false: 'True or False',
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            not_started: 'bg-gray-100 text-gray-800',
            started: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-emerald-100 text-emerald-800',
            failed: 'bg-red-100 text-red-800',
        };
        return badges[status] || badges.not_started;
    };

    const getStatusLabel = (status) => {
        const labels = {
            not_started: 'Not Started',
            started: 'In Progress',
            completed: 'Completed',
            failed: 'Failed',
        };
        return labels[status] || status;
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Quizzes</span>}
        >
            <Head title="My Quizzes" />

            <div className="student-quizzes-page py-4">
                <style>{`
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone="0"] { background-image: linear-gradient(135deg, rgb(30 58 95), rgb(74 41 70)) !important; background-color: rgb(30 58 95) !important; border-color: rgb(71 98 133) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone="1"] { background-image: linear-gradient(135deg, rgb(91 57 31), rgb(75 70 27)) !important; background-color: rgb(91 57 31) !important; border-color: rgb(133 105 53) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone="2"] { background-image: linear-gradient(135deg, rgb(67 45 100), rgb(83 43 72)) !important; background-color: rgb(67 45 100) !important; border-color: rgb(112 83 143) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone="3"] { background-image: linear-gradient(135deg, rgb(25 82 70), rgb(30 58 95)) !important; background-color: rgb(25 82 70) !important; border-color: rgb(55 123 104) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone="4"] { background-image: linear-gradient(135deg, rgb(87 70 25), rgb(91 42 50)) !important; background-color: rgb(87 70 25) !important; border-color: rgb(137 111 52) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] .text-gray-800,
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] .text-gray-700 { color: rgb(241 245 249) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] .text-gray-600,
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] .text-gray-500 { color: rgb(203 213 225) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] .bg-emerald-50 {
                        background-color: rgb(15 118 110 / 0.3) !important;
                    }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] .text-emerald-600 {
                        color: rgb(110 231 183) !important;
                    }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] [class~="bg-gray-100"] {
                        background-color: rgb(51 65 85 / 0.7) !important;
                        color: rgb(226 232 240) !important;
                    }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] [class~="bg-yellow-100"] {
                        background-color: rgb(146 64 14 / 0.4) !important;
                        color: rgb(253 230 138) !important;
                    }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] [class~="bg-emerald-100"] {
                        background-color: rgb(6 95 70 / 0.42) !important;
                        color: rgb(167 243 208) !important;
                    }
                    .studynest-layout.theme-dark .student-quizzes-page [data-card-tone] [class~="bg-red-100"] {
                        background-color: rgb(127 29 29 / 0.42) !important;
                        color: rgb(254 202 202) !important;
                    }
                    .studynest-layout.theme-dark .student-quizzes-page [class~="bg-white/70"],
                    .studynest-layout.theme-dark .student-quizzes-page [class~="bg-white/50"] { background-color: rgb(15 23 42 / 0.58) !important; color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-quizzes-page > div > .bg-white { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    @media (max-width: 640px) { .student-quizzes-page .p-6 { padding: 1rem; } }
                `}</style>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search quizzes by title or subject..."
                                        size="md"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="w-full sm:w-40">
                                        <FilterDropdown
                                            options={subjectOptions}
                                            value={subjectFilter}
                                            onChange={(val) => handleFilterChange('subject', val)}
                                            placeholder="Subject"
                                            size="md"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="w-full sm:w-40">
                                        <FilterDropdown
                                            options={statusOptions}
                                            value={statusFilter}
                                            onChange={(val) => handleFilterChange('status', val)}
                                            placeholder="Status"
                                            size="md"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Quizzes Grid */}
                            <div className="mt-6">
                                {quizzes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ChartBarIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800">
                                            No quizzes available
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Check back later for new quizzes from your teacher.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {quizzes.map((quiz, index) => {
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            const hasRemainingAttempts = quiz.attempts_used < quiz.attempts_allowed;
                                            return (
                                                <div
                                                    key={quiz.id}
                                                    data-card-tone={index % 5}
                                                    className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 backdrop-blur-sm">
                                                                    {quiz.subject}
                                                                </span>
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 backdrop-blur-sm">
                                                                    {getTypeLabel(quiz.type)}
                                                                </span>
                                                            </div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(quiz.status)}`}>
                                                                {getStatusLabel(quiz.status)}
                                                            </span>
                                                        </div>

                                                        <h3 className="mt-3 text-lg font-semibold text-gray-800 truncate max-w-full" title={quiz.title}>
                                                            {quiz.title}
                                                        </h3>

                                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">Questions:</span>
                                                                <span className="ml-1 font-medium text-gray-800">{quiz.questions}</span>
                                                            </div>
                                                            {quiz.time_limit && (
                                                                <div className="flex items-center gap-1">
                                                                    <ClockIcon className="w-3 h-3 text-gray-500" />
                                                                    <span className="text-gray-600">Time:</span>
                                                                    <span className="font-medium text-gray-800">{quiz.time_limit} min</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-gray-600">Passing:</span>
                                                                <span className="ml-1 font-medium text-gray-800">{quiz.passing_score || 75}%</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Attempts:</span>
                                                                <span className="ml-1 font-medium text-gray-800">{quiz.attempts_used}/{quiz.attempts_allowed}</span>
                                                            </div>
                                                        </div>

                                                        {quiz.status === 'completed' && (
                                                            <div className="mt-3 p-2 bg-emerald-50 rounded-lg">
                                                                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                                                    <CheckCircleIcon className="w-4 h-4" />
                                                                    Score: {quiz.score}/{quiz.questions}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="mt-4 space-y-2">
                                                            {/* Main action button */}
                                                            <Link
                                                                href={
                                                                    quiz.status === 'completed' && quiz.latest_attempt_id
                                                                        ? route('student.quizzes.results', quiz.latest_attempt_id)
                                                                        : route('student.quizzes.show', quiz.id)
                                                                }
                                                                onError={() => toast.error('Unable to open this quiz. Please try again.')}
                                                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full shadow-sm"
                                                            >
                                                                {quiz.status === 'completed' ? (
                                                                    <>
                                                                        <ChartBarIcon className="w-4 h-4 mr-1" />
                                                                        View Results
                                                                    </>
                                                                ) : quiz.status === 'started' ? (
                                                                    <>
                                                                        <ClockIcon className="w-4 h-4 mr-1" />
                                                                        Continue
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                                        Start Quiz
                                                                    </>
                                                                )}
                                                            </Link>

                                                            {/* ✅ Practice button – shown when quiz completed and attempts remain */}
                                                            {quiz.status === 'completed' && hasRemainingAttempts && (
                                                                <Link
                                                                    href={route('student.quizzes.show', quiz.id)}
                                                                    onError={() => toast.error('Unable to open this quiz. Please try again.')}
                                                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors w-full shadow-sm"
                                                                >
                                                                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                                    Practice
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                <Pagination
                                    pagination={pagination}
                                    onError={() => toast.error('Unable to load that quiz page. Please try again.')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
