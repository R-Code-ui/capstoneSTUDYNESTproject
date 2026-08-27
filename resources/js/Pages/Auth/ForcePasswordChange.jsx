import { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

const passwordRequirements = [
    { label: 'At least 8 characters', test: (password) => password.length >= 8 },
    { label: 'Contains an uppercase letter', test: (password) => /[A-Z]/.test(password) },
    { label: 'Contains a lowercase letter', test: (password) => /[a-z]/.test(password) },
    { label: 'Contains a number', test: (password) => /\d/.test(password) },
];

export default function ForcePasswordChange() {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });
    const [showPasswords, setShowPasswords] = useState({ new: false, confirmation: false });
    const completedRequirements = useMemo(
        () => passwordRequirements.filter(({ test }) => test(data.password)).length,
        [data.password],
    );
    const strength = data.password ? (completedRequirements <= 2 ? 'Weak' : completedRequirements === 3 ? 'Good' : 'Strong') : '';

    const togglePassword = (field) => {
        setShowPasswords((current) => ({ ...current, [field]: !current[field] }));
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('password.force-change.update'));
    };

    return (
        <GuestLayout heading="Secure your account">
            <Head title="Set a new password" />

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-600/50 dark:bg-slate-800/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Set your personal password</p>
                    <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
                        Choose a secure password to protect your account and continue to StudyNest.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <PasswordField
                    id="password"
                    label="New password"
                    value={data.password}
                    error={errors.password}
                    show={showPasswords.new}
                    onChange={(event) => setData('password', event.target.value)}
                    onToggle={() => togglePassword('new')}
                    autoComplete="new-password"
                    isFocused
                />

                {data.password && (
                    <div className="rounded-xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-600/50 dark:bg-slate-900/35">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>Password strength</span>
                            <span className={strength === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-300'}>{strength}</span>
                        </div>
                        <div className="mb-3 flex gap-1" aria-hidden="true">
                            {[1, 2, 3, 4].map((step) => (
                                <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= completedRequirements ? (completedRequirements === 4 ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-slate-200 dark:bg-slate-700'}`} />
                            ))}
                        </div>
                        <ul className="grid gap-1.5 sm:grid-cols-2">
                            {passwordRequirements.map(({ label, test }) => {
                                const passed = test(data.password);
                                return <li key={label} className={`flex items-center gap-1.5 text-[11px] font-semibold ${passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}><CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />{label}</li>;
                            })}
                        </ul>
                    </div>
                )}

                <PasswordField
                    id="password_confirmation"
                    label="Confirm new password"
                    value={data.password_confirmation}
                    error={errors.password_confirmation}
                    show={showPasswords.confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    onToggle={() => togglePassword('confirmation')}
                    autoComplete="new-password"
                />

                <PrimaryButton className="w-full justify-center py-3.5" disabled={processing}>
                    <LockClosedIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {processing ? 'Saving your password…' : 'Save new password and continue'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

function PasswordField({ id, label, value, error, show, onChange, onToggle, autoComplete, isFocused = false }) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <div className="relative mt-1.5">
                <TextInput id={id} type={show ? 'text' : 'password'} value={value} className="block w-full pr-12" autoComplete={autoComplete} isFocused={isFocused} onChange={onChange} />
                <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:bg-slate-700 dark:hover:text-white" aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
                    {show ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                </button>
            </div>
            <InputError message={error} className="mt-2" />
        </div>
    );
}
