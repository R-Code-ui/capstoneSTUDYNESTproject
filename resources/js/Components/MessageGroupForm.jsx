import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function MessageGroupForm({ group = null, students = [], subjects = [], grade_level = '' }) {
    const editing = Boolean(group);
    const [search, setSearch] = useState('');
    const { data, setData, errors, processing, post, put } = useForm({
        name: group?.name || '',
        description: group?.description || '',
        subject_id: group?.subject_id || '',
        grade_level: grade_level || group?.grade_level || '',
        member_ids: group?.member_ids || [],
    });

    const visibleStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return students;
        return students.filter((student) =>
            `${student.name} ${student.lrn || ''} ${student.grade_level}`.toLowerCase().includes(query)
        );
    }, [search, students]);

    const toggleStudent = (id) => {
        const memberIds = data.member_ids.includes(id)
            ? data.member_ids.filter((memberId) => memberId !== id)
            : [...data.member_ids, id];
        setData('member_ids', memberIds);
    };

    const allStudentIds = students.map((student) => student.id);
    const allStudentsSelected = allStudentIds.length > 0 && allStudentIds.every((id) => data.member_ids.includes(id));

    const toggleAllStudents = () => {
        setData('member_ids', allStudentsSelected ? [] : allStudentIds);
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        editing
            ? put(route('teacher.messages.groups.update', group.id), options)
            : post(route('teacher.messages.groups.store'), options);
    };

    return (
        <AuthenticatedLayout header={<span className="text-xl font-semibold text-gray-800">{editing ? 'Edit Group' : 'Create Group'}</span>}>
            <Head title={editing ? 'Edit Group' : 'Create Group'} />
            <style>{`
                /* Keep form controls readable when the application is in light mode. */
                .message-group-form textarea,
                .message-group-form select {
                    background-color: rgb(255 255 255) !important;
                    color: rgb(31 41 55) !important;
                    border-color: rgb(209 213 219) !important;
                }
                .message-group-form textarea::placeholder {
                    color: rgb(156 163 175) !important;
                }
                .message-group-form option {
                    background-color: rgb(255 255 255);
                    color: rgb(31 41 55);
                }
                .studynest-layout.theme-dark .message-group-form input:not([type="checkbox"]),
                .studynest-layout.theme-dark .message-group-form select,
                .studynest-layout.theme-dark .message-group-form textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .message-group-form input::placeholder,
                .studynest-layout.theme-dark .message-group-form textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .message-group-form option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
                .studynest-layout.theme-dark .message-group-form .student-list {
                    border-color: rgb(71 85 105);
                    background-color: rgb(15 23 42);
                }
                .studynest-layout.theme-dark .message-group-form .student-list label {
                    border-color: rgb(71 85 105);
                }
                .studynest-layout.theme-dark .message-group-form .student-list label:hover {
                    background-color: rgb(30 41 59);
                }
            `}</style>
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="message-group-form space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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

                    <div>
                        <InputLabel htmlFor="subject_id" value="Related subject (optional)" />
                        <select id="subject_id" value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-800 shadow-sm">
                            <option value="">No subject</option>
                            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.grade_level} · {subject.name}</option>)}
                        </select>
                        <InputError message={errors.subject_id} className="mt-1" />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <InputLabel value="Students" required />
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">{data.member_ids.length} selected</span>
                                <button
                                    type="button"
                                    onClick={toggleAllStudents}
                                    disabled={allStudentIds.length === 0}
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                                >
                                    {allStudentsSelected ? 'Clear selection' : 'Select all students'}
                                </button>
                            </div>
                        </div>
                        <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students by name or ID..." className="mt-2 block w-full" />
                        <div className="student-list mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-200">
                            {visibleStudents.length === 0 ? (
                                <p className="p-4 text-sm text-slate-500">No authorized students found.</p>
                            ) : visibleStudents.map((student) => (
                                <label key={student.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 last:border-0 hover:bg-slate-50">
                                    <input type="checkbox" checked={data.member_ids.includes(student.id)} onChange={() => toggleStudent(student.id)} className="rounded border-slate-300 text-blue-600" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-slate-700">{student.name}</span>
                                        <span className="block text-xs text-slate-400">{student.grade_level}{student.lrn ? ` · ${student.lrn}` : ''}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.member_ids} className="mt-1" />
                        <InputError message={errors['member_ids.0']} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                        <SecondaryButton type="button" onClick={() => router.visit(route('teacher.messages.index'))}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing || data.member_ids.length === 0}>{processing ? 'Saving...' : editing ? 'Save Changes' : 'Create Group'}</PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
