import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function GamesCreate({
    assigned_grades,
    statuses,
    game_types,
    games_by_grade,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedType, setSelectedType] = useState('literacy');
    const [availableGames, setAvailableGames] = useState([]);

    const { data, setData, errors, post } = useForm({
        grade_level: '',
        game_title: '',
        game_type: 'literacy',
        game_data: {},
        max_attempts: 1,
        due_date: '',
        status: 'draft',
    });

    useEffect(() => {
        if (selectedGrade && selectedType) {
            const games = games_by_grade[selectedGrade]?.[selectedType] || [];
            setAvailableGames(games);
            setData('game_data', {});
            setData('game_title', '');
        } else {
            setAvailableGames([]);
        }
    }, [selectedGrade, selectedType]);

    const handleGradeChange = (value) => {
        setSelectedGrade(value);
        setData('grade_level', value);
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setData('game_type', value);
    };

    const handleGameSelect = (gameTitle) => {
        setData('game_title', gameTitle);
        setData('game_data', {
            title: gameTitle,
            type: selectedType,
            grade: selectedGrade,
            instructions: `Play the ${gameTitle} game. Follow the instructions to complete the activity.`,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('teacher.games.store'), {
            data: {
                ...data,
                game_data: data.game_data,
            },
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const gradeOptions = [
        { value: '', label: 'Select Grade' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
    ];

    const typeOptions = [
        { value: 'literacy', label: 'Literacy' },
        { value: 'numeracy', label: 'Numeracy' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Assign Game</h2>}
        >
            <Head title="Assign Game" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <Card>
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ===== Grade Level ===== */}
                            <div>
                                <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                <select
                                    id="grade_level"
                                    value={data.grade_level}
                                    onChange={(e) => handleGradeChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    required
                                >
                                    <option value="">Select Grade Level</option>
                                    {assigned_grades.map((grade) => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                                <InputError message={errors.grade_level} className="mt-2" />
                            </div>

                            {/* ===== Game Type ===== */}
                            <div>
                                <InputLabel htmlFor="game_type" value="Game Type" required />
                                <select
                                    id="game_type"
                                    value={data.game_type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    required
                                    disabled={!data.grade_level}
                                >
                                    {typeOptions.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.game_type} className="mt-2" />
                            </div>

                            {/* ===== Select Game ===== */}
                            {data.grade_level && data.game_type && (
                                <div>
                                    <InputLabel value="Select Game" required />
                                    <div className="mt-2 grid grid-cols-1 gap-2">
                                        {availableGames.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No games available for this grade and type.
                                            </p>
                                        ) : (
                                            availableGames.map((game) => (
                                                <button
                                                    key={game}
                                                    type="button"
                                                    onClick={() => handleGameSelect(game)}
                                                    className={`
                                                        w-full text-left px-4 py-3 rounded-lg border-2 transition
                                                        ${data.game_title === game
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {game}
                                                        </span>
                                                        {data.game_title === game && (
                                                            <span className="text-blue-500">✓</span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <InputError message={errors.game_title} className="mt-2" />
                                </div>
                            )}

                            {/* ===== Game Preview ===== */}
                            {data.game_title && data.game_data && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Game Preview</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {data.game_title}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Type: {data.game_type?.charAt(0).toUpperCase() + data.game_type?.slice(1)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Grade: {data.grade_level}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                            {data.game_data?.instructions || 'Play the game and complete the activity.'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Game Settings</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="max_attempts" value="Max Attempts" />
                                        <TextInput
                                            id="max_attempts"
                                            type="number"
                                            value={data.max_attempts}
                                            onChange={(e) => setData('max_attempts', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="1"
                                            max="5"
                                        />
                                        <InputError message={errors.max_attempts} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="due_date" value="Due Date (Optional)" />
                                        <TextInput
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <InputError message={errors.due_date} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Publication Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Publication Settings</h4>
                                <div>
                                    <InputLabel htmlFor="status" value="Status" required />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        required
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.games.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Assigning...' : 'Assign Game'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
