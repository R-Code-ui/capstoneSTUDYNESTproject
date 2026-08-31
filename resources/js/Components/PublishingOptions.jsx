import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

const manilaDateTime = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
}).format(date).replace(' ', 'T');

const manilaNow = () => manilaDateTime();

const suggestedSchedule = () => manilaDateTime(new Date(Date.now() + (5 * 60 * 1000)));

const formatPublication = (value) => {
    if (!value) return '';

    return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export default function PublishingOptions({ data, setData, errors = {}, locked = false }) {
    const options = [
        { value: 'draft', label: 'Save as draft', help: 'Only you can see it' },
        { value: 'published', label: 'Publish now', help: 'Visible immediately' },
        { value: 'scheduled', label: 'Schedule', help: 'Publish automatically' },
    ];

    const selectOption = (status) => {
        setData('status', status);

        if (status === 'scheduled' && !data.publish_date) {
            setData('publish_date', suggestedSchedule());
        }
    };

    const scheduledForAnotherDay = data.status === 'scheduled'
        && data.publish_date
        && data.publish_date.slice(0, 10) !== manilaNow().slice(0, 10);

    return (
        <div className="space-y-4">
            <div>
                <InputLabel value="Publishing Option" />
                {locked ? (
                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {data.status === 'published'
                            ? `Published ${formatPublication(data.publish_date)}`
                            : 'Archived'}
                    </div>
                ) : (
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Publishing option">
                        {options.map((option) => {
                            const selected = data.status === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => selectOption(option.value)}
                                    aria-pressed={selected}
                                    className={`rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-900 ${selected
                                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:border-blue-400 dark:bg-blue-500/20 dark:ring-blue-400'
                                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-900/40 dark:hover:border-slate-500 dark:hover:bg-slate-800'}`}
                                >
                                    <span className={`block text-sm font-semibold ${selected
                                        ? 'text-blue-900 dark:text-blue-100'
                                        : 'text-gray-800 dark:text-slate-100'}`}>{option.label}</span>
                                    <span className={`block text-xs ${selected
                                        ? 'text-blue-700 dark:text-blue-200'
                                        : 'text-gray-500 dark:text-slate-400'}`}>{option.help}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <InputError message={errors.status} className="mt-2" />
            </div>

            {!locked && data.status === 'scheduled' && (
                <div>
                    <InputLabel htmlFor="publish_date" value="Schedule Date & Time" required />
                    <TextInput
                        id="publish_date"
                        type="datetime-local"
                        value={data.publish_date || ''}
                        min={manilaNow()}
                        onChange={(event) => setData('publish_date', event.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            Asia/Manila (PHT)
                            {data.publish_date ? ` · Publishes ${formatPublication(data.publish_date)}` : ''}
                        </p>
                        <button
                            type="button"
                            onClick={() => setData('publish_date', suggestedSchedule())}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                            Set to 5 minutes from now
                        </button>
                    </div>
                    {scheduledForAnotherDay && (
                        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200">
                            This is not scheduled for today. It will remain Scheduled until {formatPublication(data.publish_date)}.
                        </p>
                    )}
                    <InputError message={errors.publish_date} className="mt-2" />
                </div>
            )}
        </div>
    );
}
