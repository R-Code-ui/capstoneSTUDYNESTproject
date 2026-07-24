import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import {
    BookOpenIcon,
    CalculatorIcon,
    RocketLaunchIcon,
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

export default function GamesIndex({
    games,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gameTypeFilter, setGameTypeFilter] = useState(filters?.game_type || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        if (type === 'game_type') setGameTypeFilter(value);
        if (type === 'status') setStatusFilter(value);

        applyFilters({
            ...(type === 'game_type' ? { game_type: value } : {}),
            ...(type === 'status' ? { status: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('student.games.index'), {
            data: {
                search,
                game_type: gameTypeFilter,
                status: statusFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'literacy', label: 'Literacy' },
        { value: 'numeracy', label: 'Numeracy' },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'not_started', label: 'Not Started' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            assigned: 'bg-gray-100 text-gray-800',
            started: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-emerald-100 text-emerald-800',
        };
        return badges[status] || badges.assigned;
    };

    const getStatusLabel = (status) => {
        const labels = {
            assigned: 'Not Started',
            started: 'In Progress',
            completed: 'Completed',
        };
        return labels[status] || status;
    };

    const getTypeIcon = (type) => {
        return type === 'literacy' ? (
            <BookOpenIcon className="w-6 h-6 text-blue-600" />
        ) : (
            <CalculatorIcon className="w-6 h-6 text-purple-600" />
        );
    };

    const getTypeLabel = (type) => {
        return type === 'literacy' ? 'Literacy' : 'Numeracy';
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Games</h2>}
        >
            <Head title="My Games" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* 🔧 FIX: Removed overflow-hidden from Card container */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search games by title..."
                                        size="md"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="w-full sm:w-40">
                                        <FilterDropdown
                                            options={typeOptions}
                                            value={gameTypeFilter}
                                            onChange={(val) => handleFilterChange('game_type', val)}
                                            placeholder="Type"
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

                            {/* Games Grid */}
                            <div className="mt-6">
                                {games.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="flex justify-center mb-4">
                                            <RocketLaunchIcon className="w-16 h-16 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-800">
                                            No games assigned
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Check back later for new games from your teacher.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {games.map((game, index) => {
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            return (
                                                <div
                                                    key={game.id}
                                                    className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm">
                                                                    {getTypeIcon(game.game_type)}
                                                                </span>
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 backdrop-blur-sm">
                                                                    {getTypeLabel(game.game_type)}
                                                                </span>
                                                            </div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(game.status)}`}>
                                                                {getStatusLabel(game.status)}
                                                            </span>
                                                        </div>

                                                        <h3 className="mt-3 text-lg font-semibold text-gray-800 truncate max-w-full" title={game.title}>
                                                            {game.title}
                                                        </h3>

                                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">Attempts Remaining:</span>
                                                                <span className="ml-1 font-medium text-gray-800">{game.attempts_remaining}</span>
                                                            </div>
                                                            {game.due_date && (
                                                                <div>
                                                                    <span className="text-gray-600">Due Date:</span>
                                                                    <span className="ml-1 font-medium text-gray-800">{game.due_date}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {game.status === 'completed' && (
                                                            <div className="mt-3 p-2 bg-emerald-50 rounded-lg">
                                                                <span className="text-sm font-medium text-emerald-600">
                                                                    Score: {game.score}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="mt-4 space-y-2">
                                                            {game.status === 'completed' && (
                                                                <>
                                                                    <Link
                                                                        href={route('student.games.results', game.latest_completed_attempt_id)}
                                                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full shadow-sm"
                                                                    >
                                                                        View Results
                                                                    </Link>
                                                                    {game.attempts_remaining > 0 && (
                                                                        <Link
                                                                            href={route('student.games.show', game.id)}
                                                                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors w-full shadow-sm"
                                                                        >
                                                                            Play Again
                                                                        </Link>
                                                                    )}
                                                                </>
                                                            )}

                                                            {game.status === 'started' && (
                                                                <Link
                                                                    href={route('student.games.show', game.id)}
                                                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full shadow-sm"
                                                                >
                                                                    Continue
                                                                </Link>
                                                            )}

                                                            {game.status === 'assigned' && (
                                                                <Link
                                                                    href={route('student.games.show', game.id)}
                                                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full shadow-sm"
                                                                >
                                                                    Play Game
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
                                <Pagination pagination={pagination} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
