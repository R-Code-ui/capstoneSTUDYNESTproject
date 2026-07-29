import { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

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
        subject: '',
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
        setIsSubmitting(true);
        post(route('teacher.messages.store'), {
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">New Message</span>}
        >
            <Head title="Compose Message" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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
                                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
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
                                                    className="p-1 text-gray-400 hover:text-gray-600"
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
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
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
                                            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition ${
                                                data.category === cat.value
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                            }`}
                                        >
                                            <span>{cat.emoji}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* ===== Subject (optional) ===== */}
                            <div>
                                <InputLabel htmlFor="subject" value="Subject (optional)" />
                                <TextInput
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Short topic title..."
                                />
                                <InputError message={errors.subject} className="mt-2" />
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
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.messages.index'))}>
                                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton
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
