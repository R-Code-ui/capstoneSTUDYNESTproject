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
        max_attempts: 5,
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
            difficulty: 'standard',
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Assign Game</h2>}
        >
            <Head title="Assign Game" />

            <style>{`
                .studynest-layout.theme-dark .game-form-shell input:not([type="file"]),
                .studynest-layout.theme-dark .game-form-shell select,
                .studynest-layout.theme-dark .game-form-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .game-form-shell select:disabled {
                    background-color: rgb(51 65 85) !important;
                    color: rgb(203 213 225) !important;
                    opacity: 1 !important;
                }
                .studynest-layout.theme-dark .game-form-shell input::placeholder,
                .studynest-layout.theme-dark .game-form-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .game-form-shell option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
                .studynest-layout.theme-dark .game-form-shell .game-choice {
                    border-color: rgb(71 85 105);
                    background-color: rgb(15 23 42);
                    color: rgb(226 232 240);
                }
                .studynest-layout.theme-dark .game-form-shell .game-choice:hover {
                    border-color: rgb(96 165 250);
                    background-color: rgb(30 41 59);
                }
                .studynest-layout.theme-dark .game-form-shell .game-choice.is-selected {
                    border-color: rgb(96 165 250);
                    background-color: rgb(30 64 175 / 0.28);
                }
                .studynest-layout.theme-dark .game-form-shell .game-preview {
                    border-color: rgb(71 85 105);
                    background-color: rgb(15 23 42);
                }
            `}</style>

            <div className="py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="game-form-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* ===== Grade Level ===== */}
                            <div>
                                <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                <select
                                    id="grade_level"
                                    value={data.grade_level}
                                    onChange={(e) => handleGradeChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                            <p className="text-sm text-gray-500">
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
                                                        game-choice ${data.game_title === game
                                                            ? 'is-selected border-blue-600 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-800">
                                                            {game}
                                                        </span>
                                                        {data.game_title === game && (
                                                            <span className="text-blue-600">✓</span>
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
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Game Preview</h4>
                                    <div className="game-preview bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="text-sm font-medium text-gray-800">
                                            {data.game_title}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Type: {data.game_type?.charAt(0).toUpperCase() + data.game_type?.slice(1)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Grade: {data.grade_level}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {data.game_data?.instructions || 'Play the game and complete the activity.'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== Settings ===== */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-medium text-gray-800 mb-4">Game Settings</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="difficulty" value="Difficulty" />
                                        <select
                                            id="difficulty"
                                            value={data.game_data?.difficulty || 'standard'}
                                            onChange={(e) => setData('game_data', { ...data.game_data, difficulty: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            disabled={!data.game_title}
                                        >
                                            <option value="guided">Easy</option>
                                            <option value="standard">Average</option>
                                            <option value="challenge">Difficult</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">The game stays aligned to the selected grade.</p>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="max_attempts" value="Max Attempts (5 Maximum)" />
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
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-medium text-gray-800 mb-4">Publication Settings</h4>
                                <div>
                                    <InputLabel htmlFor="status" value="Status" required />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.games.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Assigning...' : 'Assign Game'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
