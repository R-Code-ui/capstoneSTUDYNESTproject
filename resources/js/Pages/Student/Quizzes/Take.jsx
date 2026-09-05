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

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

    window.setTimeout(() => {
        event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 150);
};

export default function QuizzesTake({ attempt, quiz, questions }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timeUp, setTimeUp] = useState(false);
    const [confirmingSubmission, setConfirmingSubmission] = useState(false);
    const submittingRef = useRef(false);
    const autoSubmitTriggeredRef = useRef(false);
    const answersRef = useRef({});

    const totalQuestions = questions.length;

    useEffect(() => {
        const initialAnswers = {};
        questions.forEach((q) => {
            if (q.user_answer !== null && q.user_answer !== undefined) {
                initialAnswers[q.id] = q.user_answer;
            }
        });
        answersRef.current = initialAnswers;
        setAnswers(initialAnswers);
    }, [questions]);

    useEffect(() => {
        autoSubmitTriggeredRef.current = false;
        setTimeUp(false);
    }, [attempt.id]);

    useEffect(() => {
        if (attempt.time_limit) {
            // The server calculates this from the attempt's creation time, so a
            // refresh or a different browser tab cannot restart the countdown.
            const remainingSeconds = Math.max(0, Number(attempt.time_remaining_seconds ?? 0));
            const endTime = Date.now() + remainingSeconds * 1000;
            let interval = null;

            sessionStorage.removeItem(`quiz_${attempt.id}_start`);

            const updateTimer = () => {
                const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

                if (remaining <= 0) {
                    setTimeRemaining('0:00');
                    setTimeUp(true);

                    if (!autoSubmitTriggeredRef.current) {
                        autoSubmitTriggeredRef.current = true;
                        if (interval) clearInterval(interval);
                        handleSubmit(true);
                    }
                    return;
                }

                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
            };

            updateTimer();
            if (!autoSubmitTriggeredRef.current) {
                interval = setInterval(updateTimer, 1000);
            }

            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [attempt.id, attempt.time_limit, attempt.time_remaining_seconds]);

    const handleAnswer = (questionId, answer) => {
        setAnswers((prev) => {
            const updatedAnswers = {
                ...prev,
                [questionId]: answer,
            };
            answersRef.current = updatedAnswers;
            return updatedAnswers;
        });
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
            // A timer effect otherwise captures the answers from its first render.
            answers: answersRef.current,
        }, {
            preserveState: true,
            onSuccess: () => toast.success(autoSubmit ? 'Quiz submitted automatically.' : 'Quiz submitted successfully.'),
            onError: () => toast.error(autoSubmit
                ? 'Time is up, but automatic submission failed. Please use Submit Quiz to try again.'
                : 'Unable to submit the quiz. Please try again.'),
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
                                className={`student-answer-option flex min-h-[52px] items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-colors ${
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
                                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 focus:ring-blue-600"
                                />
                                <span className="min-w-0 break-words text-gray-700">
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
                                className={`student-answer-option flex min-h-[52px] items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-colors ${
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
                                    className="h-5 w-5 shrink-0 text-blue-600 focus:ring-blue-600"
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
                            inputMode="text"
                            autoComplete="off"
                            value={userAnswer}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="min-h-12 w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base text-gray-800 transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
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
                <div className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="min-w-0 max-w-full break-words text-lg font-semibold leading-tight text-gray-800 sm:text-xl" title={quiz.title}>
                        {quiz.title}
                    </span>
                    <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4">
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

            <div
                className="student-quiz-take-page py-4 pb-[max(7rem,calc(5rem+env(safe-area-inset-bottom)))] sm:py-6 sm:pb-8"
                onFocusCapture={keepFocusedFieldVisible}
            >
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
                    .student-quiz-take-page input,
                    .student-quiz-take-page select,
                    .student-quiz-take-page textarea { scroll-margin-block: 9rem; }
                    .student-answer-option { transition: border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease; }
                    @media (max-width: 639px) {
                        .student-quiz-take-page input:not([type="checkbox"]):not([type="radio"]),
                        .student-quiz-take-page select,
                        .student-quiz-take-page textarea { font-size: 16px; }
                    }
                    @media (hover: none), (prefers-reduced-motion: reduce) {
                        .student-quiz-take-page * { scroll-behavior: auto !important; }
                        .student-answer-option { transition-duration: 0.01ms !important; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {isSubmitting && <LoadingSpinner overlay size="lg" text="Submitting your quiz..." />}

                    {timeUp && (
                        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
                            <ClockIcon className="h-5 w-5 shrink-0 text-red-500" />
                            <p className="text-red-600 font-medium">
                                Time's up! Your quiz is being submitted automatically.
                            </p>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-4 sm:p-6">
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
                                <div className="text-lg font-semibold leading-relaxed text-gray-800 break-words" title={currentQuestion.text}>
                                    {currentQuestion.text}
                                </div>
                                {renderQuestion(currentQuestion)}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-between sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6">
                                <div className="w-full sm:w-auto">
                                    {!isFirstQuestion && (
                                        <SecondaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={handlePrevious}>
                                            ← Previous
                                        </SecondaryButton>
                                    )}
                                </div>
                                <div className="flex w-full gap-3 sm:w-auto">
                                    {isLastQuestion ? (
                                        <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={() => handleSubmit(false)}>
                                            Submit Quiz
                                        </PrimaryButton>
                                    ) : (
                                        <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={handleNext}>
                                            Next →
                                        </PrimaryButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="mt-6">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Question Navigator</h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
                                    {questions.map((q, index) => {
                                        const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '';
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentQuestionIndex(index)}
                                                className={`
                                                    min-h-11 rounded-xl px-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1
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
