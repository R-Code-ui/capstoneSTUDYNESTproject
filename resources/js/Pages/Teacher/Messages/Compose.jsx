import { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';

import {
    ArrowLeftIcon,
    PaperAirplaneIcon,
    CheckIcon,
    ChevronDownIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_OPTIONS = [
    { value: 'lesson', label: 'Lesson', emoji: '📘' },
    { value: 'assignment', label: 'Assignment', emoji: '📝' },
    { value: 'quiz', label: 'Quiz', emoji: '🧠' },
    { value: 'educational_game', label: 'Game', emoji: '🎮' },
    { value: 'general_academic_concern', label: 'Concern', emoji: '💬' },
];

export default function MessagesCompose({ assigned_grades, students_by_grade, categories }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [studentQuery, setStudentQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data, setData, errors, post } = useForm({
        receiver_id: '',
        category: '',
        message: '',
    });

    // Filtered students based on selected grade and query
    const filteredStudents = useMemo(() => {
        const gradeStudents = students_by_grade?.[selectedGrade] || [];
        if (!studentQuery.trim()) return gradeStudents;
        const q = studentQuery.toLowerCase();
        return gradeStudents.filter((s) => s.name.toLowerCase().includes(q));
    }, [selectedGrade, studentQuery, students_by_grade]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selectStudent = (student) => {
        setSelectedStudent(student);
        setData('receiver_id', student.id);
        setStudentQuery(''); // clear search
        setDropdownOpen(false);
    };

    const clearStudent = () => {
        setSelectedStudent(null);
        setData('receiver_id', '');
    };

    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
        setSelectedStudent(null);
        setData('receiver_id', '');
        setStudentQuery('');
        setDropdownOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.receiver_id || !data.category || !data.message.trim()) {
            toast.error('Please select a recipient, category, and enter a message.');
            return;
        }
        setIsSubmitting(true);
        post(route('teacher.messages.store'), {
            preserveState: true,
            onSuccess: () => toast.success('Message sent successfully.'),
            onError: () => toast.error('Unable to send the message. Please check the highlighted fields.'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">New Message</span>}
        >
            <Head title="Compose Message" />

            <style>{`
                .studynest-layout.theme-dark .message-compose-shell input,
                .studynest-layout.theme-dark .message-compose-shell select,
                .studynest-layout.theme-dark .message-compose-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell input::placeholder,
                .studynest-layout.theme-dark .message-compose-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell option,
                .studynest-layout.theme-dark .message-compose-shell .message-dropdown {
                    background-color: rgb(15 23 42);
                    color: rgb(226 232 240);
                    border-color: rgb(71 85 105);
                }
                .studynest-layout.theme-dark .message-compose-shell .message-choice:not(.is-selected) {
                    background-color: rgb(15 23 42);
                    color: rgb(203 213 225);
                    border-color: rgb(71 85 105);
                }
                .studynest-layout.theme-dark .message-compose-shell .message-choice:not(.is-selected):hover {
                    background-color: rgb(30 41 59);
                    border-color: rgb(96 165 250);
                }
                .studynest-layout.theme-dark .message-compose-shell .message-choice.is-selected {
                    background-color: rgb(37 99 235) !important;
                    color: rgb(255 255 255) !important;
                    border-color: rgb(96 165 250) !important;
                    box-shadow: 0 0 0 2px rgb(96 165 250 / 0.28);
                }
                .studynest-layout.theme-dark .message-compose-shell .selected-student-chip {
                    background-color: rgb(30 41 59) !important;
                    border-color: rgb(59 130 246 / 0.55) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell .selected-student-avatar {
                    background-color: rgb(30 58 138) !important;
                    color: rgb(191 219 254) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell .selected-student-chip .text-gray-800 {
                    color: rgb(241 245 249) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell .selected-student-chip .text-gray-500,
                .studynest-layout.theme-dark .message-compose-shell .selected-student-chip .text-gray-400 {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell .selected-student-remove {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .message-compose-shell .selected-student-remove:hover {
                    color: rgb(226 232 240) !important;
                }
                .message-compose-shell input, .message-compose-shell textarea { scroll-margin-block: 7rem; }
                .studynest-layout.theme-dark .message-compose-actions { background-color: rgb(15 23 42 / 0.96); border-color: rgb(51 65 85); }
                @media (max-width: 639px) {
                    .message-compose-shell input,
                    .message-compose-shell textarea { font-size: 16px; }
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="message-compose-shell bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} onFocusCapture={keepFocusedFieldVisible} className="space-y-6 p-4 pb-24 sm:p-8 sm:pb-8">
                            {/* ===== Grade Selection ===== */}
                            <div>
                                <InputLabel value="Select Grade Level" required />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {assigned_grades.map((grade) => (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => handleGradeSelect(grade)}
                                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                                                selectedGrade === grade
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ===== Recipient (combobox) ===== */}
                            {selectedGrade && (
                                <div>
                                    <InputLabel value="Select Student" required />

                                    {/* Combobox wrapper */}
                                    <div className="relative mt-2" ref={dropdownRef}>
                                        {selectedStudent ? (
                                            // Selected student chip
                                            <div className="selected-student-chip flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="selected-student-avatar w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                                                        {selectedStudent.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800">
                                                            {selectedStudent.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{selectedStudent.grade_level}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={clearStudent}
                                                    className="selected-student-remove p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Search input */}
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search student by name..."
                                                        value={studentQuery}
                                                        onChange={(e) => {
                                                            setStudentQuery(e.target.value);
                                                            setDropdownOpen(true);
                                                        }}
                                                        onFocus={() => setDropdownOpen(true)}
                                                        className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-base text-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                    <svg
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <ChevronDownIcon className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Dropdown list */}
                                                {dropdownOpen && (
                                                    <ul className="message-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                                                        {filteredStudents.length > 0 ? (
                                                            filteredStudents.map((student) => (
                                                                <li
                                                                    key={student.id}
                                                                    onClick={() => selectStudent(student)}
                                                                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                                                        {student.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1 text-left">
                                                                        <div className="text-sm font-medium text-gray-800">
                                                                            {student.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">{student.grade_level}</div>
                                                                    </div>
                                                                    {data.receiver_id === student.id && (
                                                                        <CheckIcon className="w-4 h-4 text-blue-600" />
                                                                    )}
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="px-4 py-3 text-sm text-gray-400 text-center">
                                                                No students found
                                                            </li>
                                                        )}
                                                    </ul>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <InputError message={errors.receiver_id} className="mt-2" />
                                </div>
                            )}

                            {/* ===== Category ===== */}
                            <div>
                                <InputLabel value="What is this about?" required />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setData('category', cat.value)}
                                            className={`message-choice flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition ${
                                                data.category === cat.value
                                                    ? 'is-selected bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                            }`}
                                            aria-pressed={data.category === cat.value}
                                        >
                                            <span>{cat.emoji}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* ===== Message ===== */}
                            <div>
                                <InputLabel htmlFor="message" value="Message" required />
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={6}
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                    required
                                    placeholder="Type your message here..."
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="message-compose-actions sticky bottom-3 z-10 -mx-4 grid grid-cols-2 gap-3 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:flex sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0">
                                <SecondaryButton type="button" className="w-full justify-center sm:w-auto" onClick={() => router.visit(route('teacher.messages.index'))}>
                                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton className="w-full justify-center sm:w-auto"
                                    type="submit"
                                    disabled={isSubmitting || !data.receiver_id || !data.category || !data.message}
                                >
                                    <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
