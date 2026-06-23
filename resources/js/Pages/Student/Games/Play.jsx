import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function GamesPlay({ result, game }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    const questions = game.questions || [];
    const totalQuestions = questions.length;

    // Initialize answers
    const handleAnswer = (questionIndex, answer) => {
        setAnswers((prev) => ({
            ...prev,
            [questionIndex]: answer,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        if (!confirm('Submit your answers?')) {
            return;
        }

        // Calculate score
        let correctCount = 0;
        questions.forEach((question, index) => {
            const userAnswer = answers[index];
            if (userAnswer && userAnswer.trim() !== '') {
                if (question.type === 'multiple_choice') {
                    if (userAnswer === question.correct_answer) {
                        correctCount++;
                    }
                } else if (question.type === 'true_false') {
                    if (userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
                        correctCount++;
                    }
                } else if (question.type === 'identification') {
                    const user = userAnswer.trim().toLowerCase();
                    const correct = question.correct_answer.trim().toLowerCase();
                    if (user === correct) {
                        correctCount++;
                    } else if (question.alternative_answers) {
                        const alternatives = question.alternative_answers.map(a => a.trim().toLowerCase());
                        if (alternatives.includes(user)) {
                            correctCount++;
                        }
                    }
                }
            }
        });

        setScore(correctCount);
        setShowResult(true);
    };

    const handleSubmitResult = () => {
        setIsSubmitting(true);

        router.post(route('student.games.submit-result', result.id), {
            score: score,
        }, {
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    // Count answered questions
    const answeredCount = Object.keys(answers).filter((key) => {
        const answer = answers[key];
        return answer !== null && answer !== undefined && answer !== '';
    }).length;

    // Render result screen
    if (showResult) {
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Game Results: {game.title}
                        </h2>
                        <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                            Back to Games
                        </SecondaryButton>
                    </div>
                }
            >
                <Head title={`Results: ${game.title}`} />

                <div className="py-12">
                    <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                        {isSubmitting && <LoadingSpinner overlay size="lg" text="Saving your results..." />}

                        <Card className="text-center">
                            <div className="py-8">
                                <div className="text-6xl mb-4">
                                    {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪'}
                                </div>
                                <div className="text-5xl font-bold text-gray-900 dark:text-white">
                                    {percentage}%
                                </div>
                                <div className="text-2xl font-semibold mt-2">
                                    {score} / {totalQuestions}
                                </div>
                                <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                                    percentage >= 80
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : percentage >= 60
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                    {percentage >= 80 ? '🌟 Excellent!' :
                                     percentage >= 60 ? '👍 Good Job!' :
                                     '💪 Keep Practicing!'}
                                </div>
                            </div>

                            <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                                    Back to Games
                                </SecondaryButton>
                                <PrimaryButton onClick={handleSubmitResult} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Results'}
                                </PrimaryButton>
                            </div>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Render game play
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {game.title}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {answeredCount}/{totalQuestions} answered
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`Playing: ${game.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                                <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                />
                            </div>
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">No questions available for this game.</p>
                            </div>
                        ) : (
                            <>
                                {/* Question */}
                                <div className="space-y-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Question {currentQuestionIndex + 1} of {totalQuestions}
                                    </div>
                                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                                        {currentQuestion.text}
                                    </div>

                                    {/* Multiple Choice */}
                                    {currentQuestion.type === 'multiple_choice' && currentQuestion.choices && (
                                        <div className="space-y-3 mt-4">
                                            {Object.entries(currentQuestion.choices).map(([key, value]) => (
                                                <label
                                                    key={key}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                                        answers[currentQuestionIndex] === key
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${currentQuestionIndex}`}
                                                        value={key}
                                                        checked={answers[currentQuestionIndex] === key}
                                                        onChange={() => handleAnswer(currentQuestionIndex, key)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-200">
                                                        <span className="font-medium">{key}.</span> {value}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* True/False */}
                                    {currentQuestion.type === 'true_false' && (
                                        <div className="space-y-3 mt-4">
                                            {['True', 'False'].map((option) => (
                                                <label
                                                    key={option}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                                        answers[currentQuestionIndex] === option
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${currentQuestionIndex}`}
                                                        value={option}
                                                        checked={answers[currentQuestionIndex] === option}
                                                        onChange={() => handleAnswer(currentQuestionIndex, option)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-200">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* Identification */}
                                    {currentQuestion.type === 'identification' && (
                                        <div className="mt-4">
                                            <input
                                                type="text"
                                                value={answers[currentQuestionIndex] || ''}
                                                onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-gray-200 transition-colors"
                                                placeholder="Type your answer..."
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        {!isFirstQuestion && (
                                            <SecondaryButton onClick={handlePrevious}>
                                                ← Previous
                                            </SecondaryButton>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        {isLastQuestion ? (
                                            <PrimaryButton onClick={handleSubmit}>
                                                Submit Answers
                                            </PrimaryButton>
                                        ) : (
                                            <PrimaryButton onClick={handleNext}>
                                                Next →
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>

                    {/* Question Navigator */}
                    {questions.length > 0 && (
                        <div className="mt-6">
                            <Card title="Question Navigator">
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                    {questions.map((_, index) => {
                                        const isAnswered = answers[index] !== null && answers[index] !== undefined && answers[index] !== '';
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentQuestionIndex(index)}
                                                className={`
                                                    py-2 rounded-md text-sm font-medium transition-colors
                                                    ${isCurrent ? 'ring-2 ring-blue-500' : ''}
                                                    ${isAnswered
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }
                                                `}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>🟢 Answered</span>
                                    <span>⚪ Not Answered</span>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
