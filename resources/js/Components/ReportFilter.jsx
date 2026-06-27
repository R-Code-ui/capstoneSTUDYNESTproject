import FilterDropdown from '@/Components/FilterDropdown';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ReportFilter({
    schoolYearOptions = [],
    gradeOptions = [],
    teacherOptions = [],
    trimesterOptions = [],
    formData = {},
    onChange,
    onGenerate,
    onReset,
    isLoading = false,
    className = '',
}) {
    const handleChange = (field, value) => {
        if (onChange) {
            onChange({ ...formData, [field]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onGenerate) {
            onGenerate();
        }
    };

    const handleReset = () => {
        if (onReset) {
            onReset();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterDropdown
                    options={schoolYearOptions}
                    value={formData.school_year || ''}
                    onChange={(val) => handleChange('school_year', val)}
                    placeholder="School Year"
                    label="School Year"
                    size="md"
                />
                <FilterDropdown
                    options={gradeOptions}
                    value={formData.grade_level || ''}
                    onChange={(val) => handleChange('grade_level', val)}
                    placeholder="Grade Level"
                    label="Grade Level"
                    size="md"
                />
                <FilterDropdown
                    options={teacherOptions}
                    value={formData.teacher_id || ''}
                    onChange={(val) => handleChange('teacher_id', val)}
                    placeholder="Teacher"
                    label="Teacher"
                    size="md"
                />
                <FilterDropdown
                    options={trimesterOptions}
                    value={formData.trimester || ''}
                    onChange={(val) => handleChange('trimester', val)}
                    placeholder="Trimester"
                    label="Trimester"
                    size="md"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date From</label>
                    <input
                        type="date"
                        value={formData.date_from || ''}
                        onChange={(e) => handleChange('date_from', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date To</label>
                    <input
                        type="date"
                        value={formData.date_to || ''}
                        onChange={(e) => handleChange('date_to', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <SecondaryButton type="button" onClick={handleReset}>
                    Reset Filters
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </PrimaryButton>
            </div>
        </form>
    );
}
