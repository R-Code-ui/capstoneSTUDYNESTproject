import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import Modal from '@/Components/Modal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { EyeIcon } from '@heroicons/react/24/outline';

export default function StudentDirectory({
    students = [],
    pagination,
    grade_levels = [],
    school_years = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [gradeLevel, setGradeLevel] = useState(filters.grade_level || '');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '');
    const [status, setStatus] = useState(filters.status || '');
    const [gender, setGender] = useState(filters.gender || '');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.get(route('principal.students.index'), {
            search,
            grade_level: gradeLevel,
            school_year: schoolYear,
            status,
            gender,
            ...additional,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const changeFilter = (setter, key) => (value) => {
        setter(value);
        applyFilters({ [key]: value });
    };

    // Keep controls above a mobile on-screen keyboard without changing how
    // filtering or navigation works.
    const keepFocusedControlVisible = (event) => {
        const control = event.target;

        if (!['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(control.tagName)) {
            return;
        }

        window.setTimeout(() => {
            control.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
        }, 150);
    };

    const columns = [
        {
            key: 'user_id',
            label: 'User ID',
            render: (student) => <span className="font-medium text-slate-800 dark:text-slate-100">{student.user_id}</span>,
        },
        {
            key: 'name',
            label: 'Student Name',
            render: (student) => <span className="block max-w-[220px] truncate" title={student.name}>{student.name}</span>,
        },
        { key: 'grade_level', label: 'Grade Level' },
        { key: 'school_year', label: 'School Year' },
        { key: 'gender', label: 'Gender' },
        {
            key: 'is_active',
            label: 'Status',
            render: (student) => (
                <StatusBadge
                    status={student.is_active ? 'active' : 'inactive'}
                    className={student.is_active ? '' : 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100'}
                />
            ),
        },
    ];

    const studentActions = (student) => [{
        label: 'View',
        icon: <EyeIcon className="h-4 w-4" />,
        color: 'primary',
        onClick: () => setSelectedStudent(student),
    }];

    const details = selectedStudent && [
        ['User ID', selectedStudent.user_id],
        ['Student Name', selectedStudent.name],
        ['Grade Level', selectedStudent.grade_level],
        ['School Year', selectedStudent.school_year],
        ['Gender', selectedStudent.gender],
        ['Account Status', selectedStudent.is_active ? 'Active' : 'Inactive'],
        ['Date Created', selectedStudent.created_at || '—'],
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800">Student Directory</h2>}>
            <Head title="Student Directory" />

            <div
                className="scroll-pb-36 py-5 pb-[max(8rem,env(safe-area-inset-bottom))] sm:py-8 sm:pb-8 xl:py-10"
                onFocusCapture={keepFocusedControlVisible}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 sm:p-7">
                        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Principal overview</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">School-wide student directory</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">View and filter student records across all grade levels. This directory is view-only.</p>
                    </section>

                    <section className="relative mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                        <div className="space-y-4">
                            <div className="min-w-0">
                                <SearchBar
                                    value={search}
                                    onChange={setSearch}
                                    onSearch={(value) => applyFilters({ search: value })}
                                    placeholder="Search by student name or User ID"
                                    inputClassName="min-h-11 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <FilterDropdown className="w-full min-w-0" buttonClassName="min-h-11 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500" label="Grade Level" value={gradeLevel} onChange={changeFilter(setGradeLevel, 'grade_level')} options={[{ value: '', label: 'All Grades' }, ...grade_levels.map((grade) => ({ value: grade, label: grade }))]} />
                                <FilterDropdown className="w-full min-w-0" buttonClassName="min-h-11 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500" label="School Year" value={schoolYear} onChange={changeFilter(setSchoolYear, 'school_year')} options={[{ value: '', label: 'All School Years' }, ...school_years.map((year) => ({ value: year, label: year }))]} />
                                <FilterDropdown className="w-full min-w-0" buttonClassName="min-h-11 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500" label="Status" value={status} onChange={changeFilter(setStatus, 'status')} options={[{ value: '', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
                                <FilterDropdown className="w-full min-w-0" buttonClassName="min-h-11 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500" label="Gender" value={gender} onChange={changeFilter(setGender, 'gender')} options={[{ value: '', label: 'All Genders' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
                            </div>
                        </div>

                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        <div className="mt-6">
                            <Table
                                columns={columns}
                                rows={students}
                                actions={studentActions}
                                emptyMessage="No students match the selected filters."
                                hoverable
                                striped
                                responsive
                                responsiveAt="tablet"
                                pagination={pagination}
                            />
                        </div>
                    </section>
                </div>
            </div>

            <Modal show={Boolean(selectedStudent)} onClose={() => setSelectedStudent(null)} title="Student Information" size="lg">
                {selectedStudent && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">This directory provides read-only student information.</p>
                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {details.map(([label, value]) => (
                                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
                                    <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
