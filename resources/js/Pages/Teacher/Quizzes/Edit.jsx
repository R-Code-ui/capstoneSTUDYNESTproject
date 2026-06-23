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

    const { data, setData, errors, post } = useForm({
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
        attempts_allowed: quiz.attempts_allowed || 1,
        shuffle_questions: quiz.shuffle_questions || false,
        status: quiz.status || 'draft',
        publish_date: quiz.publish_date || new Date().toISOString().split('T')[0],
        questions: questions,
    });

    useEffect(() => {
        setData('questions', questions);
        setData('total_questions', questions.length);
    }, [questions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = {
            ...data,
            questions: questions,
            total_questions: questions.length,
        };

        post(route('teacher.quizzes.update', quiz.id), {
            data: formData,
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const addQuestion = () => {
        const newQuestions = [
            ...questions,
            {
                question_text: '',
                question_type: data.quiz_type || 'multiple_choice',
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
            alert('You must have at least one question.');
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
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
                        </div>
                        <div>
                            <InputLabel value="Choice B" />
                            <TextInput
                                value={question.choice_b || ''}
                                onChange={(e) => updateQuestion(index, 'choice_b', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option B"
                            />
                        </div>
                        <div>
                            <InputLabel value="Choice C" />
                            <TextInput
                                value={question.choice_c || ''}
                                onChange={(e) => updateQuestion(index, 'choice_c', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option C"
                            />
                        </div>
                        <div>
                            <InputLabel value="Choice D" />
                            <TextInput
                                value={question.choice_d || ''}
                                onChange={(e) => updateQuestion(index, 'choice_d', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Option D"
                            />
                        </div>
                        <div className="col-span-2">
                            <InputLabel value="Correct Answer" />
                            <select
                                value={question.correct_answer || ''}
                                onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                            >
                                <option value="">Select Correct Answer</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
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
                        </div>
                        <div className="col-span-2">
                            <InputLabel value="Alternative Answers (comma separated, optional)" />
                            <TextInput
                                value={(question.alternative_answers || []).join(', ')}
                                onChange={(e) => updateAlternativeAnswer(index, e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="e.g., mars, MARS, Planet Mars"
                            />
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="">Select Correct Answer</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Edit Quiz</h2>}
        >
            <Head title="Edit Quiz" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ===== Section 1: Academic Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                        <select
                                            id="grade_level"
                                            value={data.grade_level}
                                            onChange={(e) => setData('grade_level', e.target.value)}
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
                                    <div>
                                        <InputLabel htmlFor="subject" value="Subject" required />
                                        <select
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            {school_years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_year} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="trimester" value="Trimester" required />
                                        <select
                                            id="trimester"
                                            value={data.trimester}
                                            onChange={(e) => setData('trimester', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            <option value="">Select Trimester</option>
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="">None</option>
                                            {related_lessons.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_lesson_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 2: Quiz Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="quiz_type" value="Quiz Type" required />
                                        <select
                                            id="quiz_type"
                                            value={data.quiz_type}
                                            onChange={(e) => setData('quiz_type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            {quiz_types.map((type) => (
                                                <option key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
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
                                    <div>
                                        <InputLabel htmlFor="attempts_allowed" value="Attempts Allowed" />
                                        <TextInput
                                            id="attempts_allowed"
                                            type="number"
                                            value={data.attempts_allowed}
                                            onChange={(e) => setData('attempts_allowed', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="1"
                                        />
                                        <InputError message={errors.attempts_allowed} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="shuffle_questions" value="Shuffle Questions" />
                                        <select
                                            id="shuffle_questions"
                                            value={data.shuffle_questions ? '1' : '0'}
                                            onChange={(e) => setData('shuffle_questions', e.target.value === '1')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="0">No</option>
                                            <option value="1">Yes</option>
                                        </select>
                                        <InputError message={errors.shuffle_questions} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 3: Questions ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h3>
                                    <PrimaryButton type="button" onClick={addQuestion}>
                                        + Add Question
                                    </PrimaryButton>
                                </div>

                                {questions.map((question, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Question {index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div>
                                            <InputLabel value="Question Text" />
                                            <TextInput
                                                value={question.question_text}
                                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Enter your question..."
                                                required
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <InputLabel value="Question Type" />
                                            <select
                                                value={question.question_type}
                                                onChange={(e) => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[index].question_type = e.target.value;
                                                    newQuestions[index].correct_answer = '';
                                                    setQuestions(newQuestions);
                                                }}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            >
                                                {quiz_types.map((type) => (
                                                    <option key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {getQuestionTypeFields(question, index)}
                                    </div>
                                ))}

                                <InputError message={errors.questions} className="mt-2" />
                            </div>

                            {/* ===== Section 4: Publication Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publication Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <div>
                                        <InputLabel htmlFor="publish_date" value="Publish Date" required />
                                        <TextInput
                                            id="publish_date"
                                            type="date"
                                            value={data.publish_date}
                                            onChange={(e) => setData('publish_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.publish_date} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.quizzes.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Quiz'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
