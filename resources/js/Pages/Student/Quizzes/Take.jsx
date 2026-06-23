import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function QuizzesTake({ attempt, quiz, questions }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timeUp, setTimeUp] = useState(false);

    const totalQuestions = questions.length;

    // Initialize answers from existing answers
    useEffect(() => {
        const initialAnswers = {};
        questions.forEach((q) => {
            if (q.user_answer !== null && q.user_answer !== undefined) {
                initialAnswers[q.id] = q.user_answer;
            }
        });
        setAnswers(initialAnswers);
    }, [questions]);

    // Timer logic
    useEffect(() => {
        if (attempt.time_limit) {
            // Check if there's a stored start time
            const storedStart = sessionStorage.getItem(`quiz_${attempt.id}_start`);
            let startTime;

            if (storedStart) {
                startTime = new Date(parseInt(storedStart));
            } else {
                startTime = new Date();
                sessionStorage.setItem(`quiz_${attempt.id}_start`, startTime.getTime().toString());
            }

            const endTime = new Date(startTime.getTime() + attempt.time_limit * 60000);
            const updateTimer = () => {
                const now = new Date();
                const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

                if (remaining <= 0) {
                    setTimeRemaining(0);
                    setTimeUp(true);
                    // Auto-submit when time is up
                    handleSubmit(true);
                    return;
                }

                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [attempt.id, attempt.time_limit]);

    const handleAnswer = (questionId, answer) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
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

    const handleSubmit = (autoSubmit = false) => {
        if (!autoSubmit && !confirm('Are you sure you want to submit your answers?')) {
            return;
        }

        setIsSubmitting(true);

        // Clear session storage
        sessionStorage.removeItem(`quiz_${attempt.id}_start`);

        router.post(route('student.quizzes.submit', attempt.id), {
            answers: answers,
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

    // Render question based on type
    const renderQuestion = (question) => {
        const userAnswer = answers[question.id] || '';

        switch (question.type) {
            case 'multiple_choice':
                return (
                    <div className="space-y-3 mt-4">
                        {question.choices && Object.entries(question.choices).map(([key, value]) => (
                            <label
                                key={key}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    userAnswer === key
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={key}
                                    checked={userAnswer === key}
                                    onChange={() => handleAnswer(question.id, key)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-200">
                                    <span className="font-medium">{key}.</span> {value}
                                </span>
                            </label>
                        ))}
                    </div>
                );

            case 'true_false':
                return (
                    <div className="space-y-3 mt-4">
                        {['True', 'False'].map((option) => (
                            <label
                                key={option}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    userAnswer === option
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option}
                                    checked={userAnswer === option}
                                    onChange={() => handleAnswer(question.id, option)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-200">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'identification':
                return (
                    <div className="mt-4">
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-gray-200 transition-colors"
                            placeholder="Type your answer..."
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {quiz.title}
                    </h2>
                    <div className="flex items-center gap-4">
                        {timeRemaining !== null && (
                            <div className={`text-lg font-bold ${timeRemaining === '0:00' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                ⏱️ {timeRemaining}
                            </div>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {answeredCount}/{totalQuestions} answered
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`Taking: ${quiz.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {isSubmitting && <LoadingSpinner overlay size="lg" text="Submitting your quiz..." />}

                    {timeUp && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 font-medium">
                                ⏰ Time's up! Your quiz is being submitted automatically.
                            </p>
                        </div>
                    )}

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

                        {/* Question */}
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </div>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                                {currentQuestion.text}
                            </div>
                            {renderQuestion(currentQuestion)}
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
                                    <PrimaryButton onClick={() => handleSubmit(false)}>
                                        Submit Quiz
                                    </PrimaryButton>
                                ) : (
                                    <PrimaryButton onClick={handleNext}>
                                        Next →
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Question Navigator */}
                    <div className="mt-6">
                        <Card title="Question Navigator">
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                {questions.map((q, index) => {
                                    const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '';
                                    const isCurrent = index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={q.id}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
