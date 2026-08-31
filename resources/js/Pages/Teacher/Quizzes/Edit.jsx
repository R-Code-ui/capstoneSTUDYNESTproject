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
import PublishingOptions from '@/Components/PublishingOptions';
import { ConfirmModal } from '@/Components/Modal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function QuizzesEdit({
    quiz,
    assigned_grades,
    subjects,
    quiz_types,
    trimesters,
    school_years,
    statuses,
    weeks,
    related_lessons,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState(quiz.questions || []);
    const [questionIndexToRemove, setQuestionIndexToRemove] = useState(null);

    const { data, setData, errors, put, transform } = useForm({
        grade_level: quiz.grade_level || '',
        subject: quiz.subject || '',
        school_year: quiz.school_year || '',
        trimester: quiz.trimester || '',
        week_number: quiz.week_number || '',
        related_lesson_id: quiz.related_lesson_id || '',
        quiz_title: quiz.quiz_title || '',
        quiz_type: quiz.quiz_type || 'multiple_choice',
        total_questions: quiz.total_questions || 1,
        time_limit: quiz.time_limit || '',
        passing_score: quiz.passing_score || '',
        attempts_allowed: quiz.attempts_allowed || 1,   // ✅ pre‑fill
        shuffle_questions: quiz.shuffle_questions || false,
        status: quiz.status || 'draft',
        publish_date: quiz.publish_date || '',
        questions: questions,
    });

    useEffect(() => {
        setData('questions', questions);
        setData('total_questions', questions.length);
    }, [questions]);

    const handleQuizTypeChange = (e) => {
        const newType = e.target.value;
        setData('quiz_type', newType);

        const updatedQuestions = questions.map((q) => ({
            ...q,
            question_type: newType,
            choice_a: '',
            choice_b: '',
            choice_c: '',
            choice_d: '',
            correct_answer: '',
            alternative_answers: [],
        }));
        setQuestions(updatedQuestions);
    };

    const relatedLessonsForSelectedGrade = related_lessons.filter(
        (lesson) => lesson.grade_level === data.grade_level
    );

    const handleGradeLevelChange = (e) => {
        const gradeLevel = e.target.value;
        const selectedLesson = related_lessons.find(
            (lesson) => lesson.id === parseInt(data.related_lesson_id)
        );

        setData('grade_level', gradeLevel);

        if (selectedLesson && selectedLesson.grade_level !== gradeLevel) {
            setData('related_lesson_id', '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const hasEmptyQuestion = questions.some(q => !q.question_text.trim());
        if (hasEmptyQuestion) {
            toast.error('Please fill in all question text fields.');
            setIsSubmitting(false);
            return;
        }

        const hasNoCorrectAnswer = questions.some(q => !q.correct_answer);
        if (hasNoCorrectAnswer) {
            toast.error('Please select a correct answer for all questions.');
            setIsSubmitting(false);
            return;
        }

        transform((currentData) => ({
            ...currentData,
            questions,
            total_questions: questions.length,
        }));

        put(route('teacher.quizzes.update', quiz.id), {
            preserveState: true,
            onSuccess: () => { setIsSubmitting(false); toast.success('Quiz updated successfully.'); },
            onError: () => { setIsSubmitting(false); toast.error('Please correct the highlighted fields and try again.'); },
        });
    };

    const addQuestion = () => {
        const newQuestions = [
            ...questions,
            {
                question_text: '',
                question_type: data.quiz_type,
                choice_a: '',
                choice_b: '',
                choice_c: '',
                choice_d: '',
                correct_answer: '',
                alternative_answers: [],
            },
        ];
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        if (questions.length <= 1) {
            toast.error('A quiz must have at least one question.');
            return;
        }
        setQuestionIndexToRemove(index);
    };

    const confirmRemoveQuestion = () => {
        if (questionIndexToRemove === null) return;
        const newQuestions = questions.filter((_, index) => index !== questionIndexToRemove);
        setQuestions(newQuestions);
        setQuestionIndexToRemove(null);
        toast.success('Question removed.');
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateAlternativeAnswer = (index, value) => {
        const newQuestions = [...questions];
        if (value) {
            newQuestions[index].alternative_answers = value.split(',').map((item) => item.trim());
        } else {
            newQuestions[index].alternative_answers = [];
        }
        setQuestions(newQuestions);
    };

    const getQuestionError = (questionIndex, field) => {
        const key = `questions.${questionIndex}.${field}`;
        return errors[key];
    };

    const getQuestionTypeFields = (question, index) => {
        switch (question.question_type) {
            case 'multiple_choice':
                return (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                            <InputLabel value="Choice A" />
                            <TextInput
                                value={question.choice_a || ''}
                                onChange={(e) => updateQuestion(index, 'choice_a', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option A"
                            />
                            <InputError message={getQuestionError(index, 'choice_a')} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Choice B" />
                            <TextInput
                                value={question.choice_b || ''}
                                onChange={(e) => updateQuestion(index, 'choice_b', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option B"
                            />
                            <InputError message={getQuestionError(index, 'choice_b')} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Choice C" />
                            <TextInput
                                value={question.choice_c || ''}
                                onChange={(e) => updateQuestion(index, 'choice_c', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option C"
                            />
                            <InputError message={getQuestionError(index, 'choice_c')} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Choice D" />
                            <TextInput
                                value={question.choice_d || ''}
                                onChange={(e) => updateQuestion(index, 'choice_d', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option D"
                            />
                            <InputError message={getQuestionError(index, 'choice_d')} className="mt-1" />
                        </div>
                        <div className="col-span-2">
                            <InputLabel value="Correct Answer" />
                            <select
                                value={question.correct_answer || ''}
                                onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                            >
                                <option value="">Select Correct Answer</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                            <InputError message={getQuestionError(index, 'correct_answer')} className="mt-1" />
                        </div>
                    </div>
                );
            case 'identification':
                return (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="col-span-2">
                            <InputLabel value="Correct Answer" />
                            <TextInput
                                value={question.correct_answer || ''}
                                onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="e.g., Mars"
                            />
                            <InputError message={getQuestionError(index, 'correct_answer')} className="mt-1" />
                        </div>
                        <div className="col-span-2">
                            <InputLabel value="Alternative Answers (comma separated, optional)" />
                            <TextInput
                                value={(question.alternative_answers || []).join(', ')}
                                onChange={(e) => updateAlternativeAnswer(index, e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="e.g., mars, MARS, Planet Mars"
                            />
                            <InputError message={getQuestionError(index, 'alternative_answers')} className="mt-1" />
                        </div>
                    </div>
                );
            case 'true_false':
                return (
                    <div className="mt-3">
                        <InputLabel value="Correct Answer" />
                        <select
                            value={question.correct_answer || ''}
                            onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                        >
                            <option value="">Select Correct Answer</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                        <InputError message={getQuestionError(index, 'correct_answer')} className="mt-1" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">Edit Quiz</span>}
        >
            <Head title="Edit Quiz" />
            <style>{`
                .studynest-layout.theme-dark .quiz-form-shell input:not([type="file"]),
                .studynest-layout.theme-dark .quiz-form-shell select,
                .studynest-layout.theme-dark .quiz-form-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .quiz-form-shell input::placeholder,
                .studynest-layout.theme-dark .quiz-form-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .quiz-form-shell option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
            `}</style>

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="quiz-form-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* ===== Basic Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                                <div>
                                    <InputLabel htmlFor="quiz_title" value="Quiz Title" required />
                                    <TextInput
                                        id="quiz_title"
                                        value={data.quiz_title}
                                        onChange={(e) => setData('quiz_title', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Enter quiz title"
                                        required
                                    />
                                    <InputError message={errors.quiz_title} className="mt-2" />
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                        <select
                                            id="grade_level"
                                            value={data.grade_level}
                                            onChange={handleGradeLevelChange}
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
                                    <div>
                                        <InputLabel htmlFor="subject" value="Subject" required />
                                        <select
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map((subject) => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.subject} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="school_year" value="School Year" required />
                                        <select
                                            id="school_year"
                                            value={data.school_year}
                                            onChange={(e) => setData('school_year', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            {school_years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_year} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="trimester" value="Term" required />
                                        <select
                                            id="trimester"
                                            value={data.trimester}
                                            onChange={(e) => setData('trimester', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            <option value="">Select Term</option>
                                            {trimesters.map((trimester) => (
                                                <option key={trimester} value={trimester}>{trimester}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.trimester} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="week_number" value="Week Number" required />
                                        <select
                                            id="week_number"
                                            value={data.week_number}
                                            onChange={(e) => setData('week_number', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            <option value="">Select Week</option>
                                            {weeks.map((week) => (
                                                <option key={week} value={week}>{week}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.week_number} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="related_lesson_id" value="Related Lesson (Optional)" />
                                        <select
                                            id="related_lesson_id"
                                            value={data.related_lesson_id}
                                            onChange={(e) => setData('related_lesson_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="">None</option>
                                            {relatedLessonsForSelectedGrade.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_lesson_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Quiz Settings */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Settings</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="quiz_type" value="Quiz Type" required />
                                        <select
                                            id="quiz_type"
                                            value={data.quiz_type}
                                            onChange={handleQuizTypeChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            {quiz_types.map((type) => (
                                                <option key={type} value={type}>
                                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.quiz_type} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="time_limit" value="Time Limit (minutes, optional)" />
                                        <TextInput
                                            id="time_limit"
                                            type="number"
                                            value={data.time_limit}
                                            onChange={(e) => setData('time_limit', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="1"
                                        />
                                        <InputError message={errors.time_limit} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="passing_score" value="Passing Score % (optional)" />
                                        <TextInput
                                            id="passing_score"
                                            type="number"
                                            value={data.passing_score}
                                            onChange={(e) => setData('passing_score', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="0"
                                            max="100"
                                        />
                                        <InputError message={errors.passing_score} className="mt-2" />
                                    </div>
                                    {/* ✅ NEW: Attempts Allowed */}
                                    <div>
                                        <InputLabel htmlFor="attempts_allowed" value="Attempts Allowed (including practice)" />
                                        <TextInput
                                            id="attempts_allowed"
                                            type="number"
                                            value={data.attempts_allowed}
                                            onChange={(e) => setData('attempts_allowed', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="1"
                                            max="10"
                                            required
                                        />
                                        <InputError message={errors.attempts_allowed} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="shuffle_questions" value="Shuffle Questions" />
                                        <select
                                            id="shuffle_questions"
                                            value={data.shuffle_questions ? '1' : '0'}
                                            onChange={(e) => setData('shuffle_questions', e.target.value === '1')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="0">No</option>
                                            <option value="1">Yes</option>
                                        </select>
                                        <InputError message={errors.shuffle_questions} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
                                    <PrimaryButton type="button" onClick={addQuestion}>
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Add Question
                                    </PrimaryButton>
                                </div>

                                <InputError message={errors.questions} className="mb-2" />

                                {questions.map((question, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                                            <h4 className="font-medium text-gray-800">
                                                Question {index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(index)}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Remove
                                            </button>
                                        </div>

                                        <div>
                                            <InputLabel value="Question Text" required />
                                            <TextInput
                                                value={question.question_text}
                                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Enter your question..."
                                            />
                                            <InputError message={getQuestionError(index, 'question_text')} className="mt-1" />
                                        </div>

                                        {getQuestionTypeFields(question, index)}
                                    </div>
                                ))}
                            </div>

                            {/* Publication Settings */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Publication Settings</h3>
                                <PublishingOptions
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    locked={['published', 'archived'].includes(quiz.status)}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.quizzes.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Quiz'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ConfirmModal
                show={questionIndexToRemove !== null}
                onClose={() => setQuestionIndexToRemove(null)}
                onConfirm={confirmRemoveQuestion}
                title="Remove question?"
                message="This question will be removed from the quiz."
                confirmText="Remove question"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
