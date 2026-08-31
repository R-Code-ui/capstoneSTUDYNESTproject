import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

// Heroicons
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function QuizzesTake({ attempt, quiz, questions }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timeUp, setTimeUp] = useState(false);
    const [confirmingSubmission, setConfirmingSubmission] = useState(false);
    const submittingRef = useRef(false);

    const totalQuestions = questions.length;

    useEffect(() => {
        const initialAnswers = {};
        questions.forEach((q) => {
            if (q.user_answer !== null && q.user_answer !== undefined) {
                initialAnswers[q.id] = q.user_answer;
            }
        });
        setAnswers(initialAnswers);
    }, [questions]);

    useEffect(() => {
        if (attempt.time_limit) {
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
                    setTimeRemaining('0:00');
                    setTimeUp(true);
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
        if (!autoSubmit) {
            if (answeredCount < totalQuestions) {
                toast.warning(`You still have ${totalQuestions - answeredCount} unanswered question${totalQuestions - answeredCount === 1 ? '' : 's'}.`);
            }
            setConfirmingSubmission(true);
            return;
        }

        submitQuiz(true);
    };

    const submitQuiz = (autoSubmit = false) => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setConfirmingSubmission(false);
        setIsSubmitting(true);
        sessionStorage.removeItem(`quiz_${attempt.id}_start`);

        if (autoSubmit) toast.info("Time's up. Submitting your quiz automatically.");

        router.post(route('student.quizzes.submit', attempt.id), {
            answers: answers,
        }, {
            preserveState: true,
            onSuccess: () => toast.success(autoSubmit ? 'Quiz submitted automatically.' : 'Quiz submitted successfully.'),
            onError: () => toast.error('Unable to submit the quiz. Please try again.'),
            onFinish: () => {
                submittingRef.current = false;
                setIsSubmitting(false);
            },
        });
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    const answeredCount = Object.keys(answers).filter((key) => {
        const answer = answers[key];
        return answer !== null && answer !== undefined && answer !== '';
    }).length;

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
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={key}
                                    checked={userAnswer === key}
                                    onChange={() => handleAnswer(question.id, key)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                                />
                                <span className="text-gray-700">
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
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option}
                                    checked={userAnswer === option}
                                    onChange={() => handleAnswer(question.id, option)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                                />
                                <span className="text-gray-700">{option}</span>
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
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-gray-800 transition-colors"
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="min-w-0 max-w-full truncate text-xl font-semibold leading-tight text-gray-800" title={quiz.title}>
                        {quiz.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-4">
                        {timeRemaining !== null && (
                            <div className={`text-lg font-bold flex items-center gap-1 ${
                                timeRemaining === '0:00' ? 'text-red-600' : 'text-gray-700'
                            }`}>
                                <ClockIcon className="w-5 h-5" />
                                {timeRemaining}
                            </div>
                        )}
                        <span className="text-sm text-gray-500">
                            {answeredCount}/{totalQuestions} answered
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`Taking: ${quiz.title}`} />

            <div className="student-quiz-take-page py-4">
                <style>{`
                    .studynest-layout.theme-dark .student-quiz-take-page .bg-white { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page .bg-gray-200 { background-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page .bg-gray-50 { background-color: rgb(30 41 59) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page .border-gray-200,
                    .studynest-layout.theme-dark .student-quiz-take-page .border-gray-300 { border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page .text-gray-800,
                    .studynest-layout.theme-dark .student-quiz-take-page .text-gray-700 { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page .text-gray-600,
                    .studynest-layout.theme-dark .student-quiz-take-page .text-gray-500 { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page label.bg-blue-50 { background-color: rgb(30 58 138) !important; border-color: rgb(96 165 250) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page label.bg-blue-50 .text-gray-700 { color: rgb(239 246 255) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page input[type="text"] { background-color: rgb(30 41 59) !important; color: rgb(226 232 240) !important; border-color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .student-quiz-take-page input[type="radio"] { accent-color: rgb(59 130 246); }
                    .student-quiz-take-page .break-words { overflow-wrap: anywhere; word-break: break-word; }
                    @media (max-width: 640px) { .student-quiz-take-page .p-6 { padding: 1rem; } }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {isSubmitting && <LoadingSpinner overlay size="lg" text="Submitting your quiz..." />}

                    {timeUp && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-red-500" />
                            <p className="text-red-600 font-medium">
                                Time's up! Your quiz is being submitted automatically.
                            </p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                                    <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="space-y-4">
                                <div className="text-sm text-gray-500">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </div>
                                <div className="text-lg font-medium text-gray-800 break-words line-clamp-3" title={currentQuestion.text}>
                                    {currentQuestion.text}
                                </div>
                                {renderQuestion(currentQuestion)}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex flex-wrap justify-between mt-8 pt-6 border-t border-gray-200">
                                <div>
                                    {!isFirstQuestion && (
                                        <SecondaryButton onClick={handlePrevious}>
                                            ← Previous
                                        </SecondaryButton>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
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
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Question Navigator</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                    {questions.map((q, index) => {
                                        const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '';
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentQuestionIndex(index)}
                                                className={`
                                                    py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1
                                                    ${isCurrent ? 'ring-2 ring-blue-600' : ''}
                                                    ${isAnswered
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }
                                                `}
                                            >
                                                {index + 1}
                                                {isAnswered && <CheckCircleIcon className="w-3 h-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                        Answered
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <XCircleIcon className="w-4 h-4 text-gray-400" />
                                        Not Answered
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                show={confirmingSubmission}
                onClose={() => setConfirmingSubmission(false)}
                onConfirm={() => submitQuiz(false)}
                title="Submit your answers?"
                message={answeredCount < totalQuestions ? `You have ${totalQuestions - answeredCount} unanswered question${totalQuestions - answeredCount === 1 ? '' : 's'}. Do you still want to submit?` : 'Are you ready to submit your answers?'}
                confirmText="Submit quiz"
                cancelText="Review answers"
                confirmColor="blue"
            />
        </AuthenticatedLayout>
    );
}
