import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { toast } from 'sonner';

export default function MessageGroupForm({
    group = null,
    students = [],
    assignedGrades = [],
    selectedGradeLevels = [],
}) {
    const editing = Boolean(group);
    const initialGradeLevels = selectedGradeLevels.length > 0
        ? selectedGradeLevels
        : assignedGrades.length === 1
            ? assignedGrades
            : [];
    const [search, setSearch] = useState('');
    const [expandedGrades, setExpandedGrades] = useState(initialGradeLevels);
    const { data, setData, errors, processing, post, put } = useForm({
        name: group?.name || '',
        description: group?.description || '',
        grade_levels: initialGradeLevels,
        member_ids: group?.member_ids || [],
    });

    const selectedGradeSet = useMemo(() => new Set(data.grade_levels), [data.grade_levels]);
    const selectedStudents = useMemo(
        () => students.filter((student) => selectedGradeSet.has(student.grade_level)),
        [students, selectedGradeSet]
    );
    const groupedStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return data.grade_levels.map((grade) => {
            const gradeStudents = selectedStudents.filter((student) => student.grade_level === grade);
            const visibleStudents = query
                ? gradeStudents.filter((student) =>
                    `${student.name} ${student.lrn || ''} ${student.grade_level}`.toLowerCase().includes(query)
                )
                : gradeStudents;

            return { grade, gradeStudents, visibleStudents };
        });
    }, [data.grade_levels, search, selectedStudents]);

    const selectedStudentIds = selectedStudents.map((student) => student.id);
    const allStudentsSelected = selectedStudentIds.length > 0
        && selectedStudentIds.every((id) => data.member_ids.includes(id));
    const allGradesSelected = assignedGrades.length > 0
        && assignedGrades.every((grade) => selectedGradeSet.has(grade));

    const orderGrades = (grades) => assignedGrades.filter((grade) => grades.includes(grade));

    const toggleGrade = (grade) => {
        const isSelected = selectedGradeSet.has(grade);
        const nextGrades = orderGrades(
            isSelected
                ? data.grade_levels.filter((item) => item !== grade)
                : [...data.grade_levels, grade]
        );
        const nextMembers = isSelected
            ? data.member_ids.filter((id) => students.find((student) => student.id === id)?.grade_level !== grade)
            : data.member_ids;
        setData({ ...data, grade_levels: nextGrades, member_ids: nextMembers });
        setExpandedGrades((current) => isSelected
            ? current.filter((item) => item !== grade)
            : [...new Set([...current, grade])]
        );
    };

    const toggleAllGrades = () => {
        if (allGradesSelected) {
            setData({ ...data, grade_levels: [], member_ids: [] });
            setExpandedGrades([]);
            return;
        }

        setData({
            ...data,
            grade_levels: assignedGrades,
        });
        setExpandedGrades(assignedGrades);
    };

    const toggleStudent = (id) => {
        const memberIds = data.member_ids.includes(id)
            ? data.member_ids.filter((memberId) => memberId !== id)
            : [...data.member_ids, id];
        setData('member_ids', memberIds);
    };

    const toggleGradeStudents = (gradeStudents) => {
        const ids = gradeStudents.map((student) => student.id);
        const allSelected = ids.length > 0 && ids.every((id) => data.member_ids.includes(id));
        const memberIds = allSelected
            ? data.member_ids.filter((id) => !ids.includes(id))
            : [...new Set([...data.member_ids, ...ids])];
        setData('member_ids', memberIds);
    };

    const toggleAllStudents = () => {
        const memberIds = allStudentsSelected
            ? data.member_ids.filter((id) => !selectedStudentIds.includes(id))
            : [...new Set([...data.member_ids, ...selectedStudentIds])];
        setData('member_ids', memberIds);
    };

    const toggleExpanded = (grade) => {
        setExpandedGrades((current) => current.includes(grade)
            ? current.filter((item) => item !== grade)
            : [...current, grade]
        );
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => toast.success(editing ? 'Group updated successfully.' : 'Group created successfully.'),
            onError: () => toast.error('Please correct the highlighted fields and try again.'),
        };
        editing
            ? put(route('teacher.messages.groups.update', group.id), options)
            : post(route('teacher.messages.groups.store'), options);
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout header={<span className="text-xl font-semibold text-gray-800">{editing ? 'Edit Group' : 'Create Group'}</span>}>
            <Head title={editing ? 'Edit Group' : 'Create Group'} />
            <style>{`
                .message-group-form textarea {
                    background-color: rgb(255 255 255) !important;
                    color: rgb(31 41 55) !important;
                    border-color: rgb(209 213 219) !important;
                }
                .message-group-form textarea::placeholder { color: rgb(156 163 175) !important; }
                .studynest-layout.theme-dark .message-group-form input:not([type="checkbox"]),
                .studynest-layout.theme-dark .message-group-form textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .message-group-form input::placeholder,
                .studynest-layout.theme-dark .message-group-form textarea::placeholder { color: rgb(148 163 184) !important; }
                .studynest-layout.theme-dark .message-group-form .student-list,
                .studynest-layout.theme-dark .message-group-form .student-grade-group { border-color: rgb(51 65 85); }
                .studynest-layout.theme-dark .message-group-form .student-list { background-color: rgb(15 23 42); }
                .studynest-layout.theme-dark .message-group-form .student-grade-header { background-color: rgb(30 41 59); }
                .studynest-layout.theme-dark .message-group-form .student-row { border-color: rgb(51 65 85); }
                .studynest-layout.theme-dark .message-group-form .student-row:hover { background-color: rgb(30 41 59); }
                .studynest-layout.theme-dark .message-group-form .grade-select-button {
                    background-color: rgb(30 64 175 / 0.25);
                    border-color: rgb(96 165 250 / 0.55);
                    color: rgb(147 197 253);
                }
                .studynest-layout.theme-dark .message-group-form .grade-select-button:hover {
                    background-color: rgb(30 64 175 / 0.45);
                    color: rgb(191 219 254);
                }
                .message-group-form input, .message-group-form textarea { scroll-margin-block: 7rem; }
                .studynest-layout.theme-dark .message-group-actions { background-color: rgb(15 23 42 / 0.96); border-color: rgb(51 65 85); }
                @media (max-width: 639px) {
                    .message-group-form input:not([type="checkbox"]),
                    .message-group-form textarea { font-size: 16px; }
                }
            `}</style>
            <div className="mx-auto max-w-3xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 lg:px-8">
                <form onSubmit={submit} onFocusCapture={keepFocusedFieldVisible} className="message-group-form space-y-6 rounded-xl border border-slate-200 bg-white p-4 pb-24 shadow-sm sm:p-6 sm:pb-6">
                    <div>
                        <InputLabel htmlFor="name" value="Group name" required />
                        <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" required />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description (optional)" />
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 shadow-sm" />
                        <InputError message={errors.description} className="mt-1" />
                    </div>

                    <fieldset>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <legend className="text-sm font-medium text-gray-700">Grades included <span className="text-red-500">*</span></legend>
                                <p className="mt-1 text-xs text-slate-500">Choose which assigned grades can be added to this group.</p>
                            </div>
                            {assignedGrades.length > 1 && (
                                <button type="button" onClick={toggleAllGrades} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                                    {allGradesSelected ? 'Clear grades' : 'Select all grades'}
                                </button>
                            )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {assignedGrades.map((grade) => {
                                const selected = selectedGradeSet.has(grade);
                                return (
                                    <button
                                        key={grade}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleGrade(grade)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${selected
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                            : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700'
                                        }`}
                                    >
                                        {selected && <span aria-hidden="true">✓ </span>}{grade}
                                    </button>
                                );
                            })}
                        </div>
                        {assignedGrades.length === 0 && <p className="mt-3 text-sm text-amber-700">No grade assignments were found.</p>}
                        <InputError message={errors.grade_levels} className="mt-2" />
                        <InputError message={errors['grade_levels.0']} className="mt-2" />
                    </fieldset>

                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <InputLabel value="Students" required />
                                <p className="mt-1 text-xs text-slate-500">{data.member_ids.length} selected across {data.grade_levels.length} {data.grade_levels.length === 1 ? 'grade' : 'grades'}</p>
                            </div>
                            {selectedStudentIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={toggleAllStudents}
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                >
                                    {allStudentsSelected ? 'Clear all students' : `Select all ${selectedStudentIds.length} students`}
                                </button>
                            )}
                        </div>

                        {data.grade_levels.length === 0 ? (
                            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                <p className="text-sm font-medium text-slate-600">Choose at least one grade to view students.</p>
                            </div>
                        ) : (
                            <>
                                <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students by name or ID..." className="mt-3 block w-full" />
                                <div className="student-list mt-3 max-h-[28rem] overflow-y-auto rounded-lg border border-slate-200">
                                    {groupedStudents.map(({ grade, gradeStudents, visibleStudents }) => {
                                        const selectedCount = gradeStudents.filter((student) => data.member_ids.includes(student.id)).length;
                                        const gradeSelected = gradeStudents.length > 0 && selectedCount === gradeStudents.length;
                                        const expanded = expandedGrades.includes(grade);

                                        if (search.trim() && visibleStudents.length === 0) return null;

                                        return (
                                            <section key={grade} className="student-grade-group border-b border-slate-200 last:border-0">
                                                <div className="student-grade-header flex items-center justify-between gap-3 bg-slate-50 px-3 py-2.5">
                                                    <button type="button" onClick={() => toggleExpanded(grade)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                                                        <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 text-slate-500 transition ${expanded ? '' : '-rotate-90'}`} />
                                                        <span className="truncate text-sm font-bold text-slate-700">{grade}</span>
                                                        <span className="whitespace-nowrap text-xs text-slate-500">{selectedCount} of {gradeStudents.length} selected</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={gradeStudents.length === 0}
                                                        onClick={() => toggleGradeStudents(gradeStudents)}
                                                        className="grade-select-button inline-flex items-center justify-center whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {gradeSelected ? `Clear ${grade}` : `Select all ${grade}`}
                                                    </button>
                                                </div>

                                                {expanded && (
                                                    <div>
                                                        {visibleStudents.length === 0 ? (
                                                            <p className="p-4 text-sm text-slate-500">No students found in {grade}.</p>
                                                        ) : visibleStudents.map((student) => (
                                                            <label key={student.id} className="student-row flex cursor-pointer items-center gap-3 border-t border-slate-100 p-3 hover:bg-slate-50">
                                                                <input type="checkbox" checked={data.member_ids.includes(student.id)} onChange={() => toggleStudent(student.id)} className="rounded border-slate-300 text-blue-600" />
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block text-sm font-medium text-slate-700">{student.name}</span>
                                                                    {student.lrn && <span className="block text-xs text-slate-400">Student ID: {student.lrn}</span>}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        );
                                    })}

                                    {search.trim() && groupedStudents.every(({ visibleStudents }) => visibleStudents.length === 0) && (
                                        <p className="p-6 text-center text-sm text-slate-500">No students match “{search.trim()}”.</p>
                                    )}
                                </div>
                            </>
                        )}
                        <InputError message={errors.member_ids} className="mt-1" />
                        <InputError message={errors['member_ids.0']} className="mt-1" />
                    </div>

                    <div className="message-group-actions sticky bottom-3 z-10 -mx-4 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white/95 px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:flex sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0">
                        <SecondaryButton type="button" className="w-full justify-center sm:w-auto" onClick={() => router.visit(route('teacher.messages.index'))}>Cancel</SecondaryButton>
                        <PrimaryButton className="w-full justify-center sm:w-auto" disabled={processing || data.grade_levels.length === 0 || data.member_ids.length === 0}>{processing ? 'Saving...' : editing ? 'Save Changes' : 'Create Group'}</PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
