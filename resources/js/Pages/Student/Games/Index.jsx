import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { Link } from '@inertiajs/react';

export default function GamesIndex({ games, filters }) {
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
            assigned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            started: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
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
        return type === 'literacy' ? '📖' : '🧮';
    };

    const getTypeLabel = (type) => {
        return type === 'literacy' ? 'Literacy' : 'Numeracy';
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Games</h2>}
        >
            <Head title="My Games" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
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
                                    <div className="text-6xl mb-4">🎮</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No games assigned
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Check back later for new games from your teacher.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {games.map((game) => (
                                        <div
                                            key={game.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{getTypeIcon(game.game_type)}</span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {getTypeLabel(game.game_type)}
                                                        </span>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(game.status)}`}>
                                                        {getStatusLabel(game.status)}
                                                    </span>
                                                </div>

                                                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                                                    {game.title}
                                                </h3>

                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Attempts Remaining:</span>
                                                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{game.attempts_remaining}</span>
                                                    </div>
                                                    {game.due_date && (
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                                                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{game.due_date}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {game.status === 'completed' && (
                                                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            Score: {game.score}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <Link
                                                        href={route('student.games.show', game.id)}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full justify-center"
                                                    >
                                                        {game.status === 'completed' ? 'View Results' :
                                                         game.status === 'started' ? 'Continue' :
                                                         'Play Game'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
