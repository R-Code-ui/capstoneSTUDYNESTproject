import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [visibleFields, setVisibleFields] = useState({
        current_password: false,
        password: false,
        password_confirmation: false,
    });

    const toggleVisibility = (field) => {
        setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
    };

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <div className="relative">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={visibleFields.current_password ? 'text' : 'password'}
                            className="mt-1 block w-full pr-12 text-base sm:text-sm"
                            autoComplete="current-password"
                        />
                        <button type="button" onClick={() => toggleVisibility('current_password')} className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800" aria-label={visibleFields.current_password ? 'Hide current password' : 'Show current password'} title={visibleFields.current_password ? 'Hide password' : 'Show password'}>
                            {visibleFields.current_password ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <div className="relative">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={visibleFields.password ? 'text' : 'password'}
                            className="mt-1 block w-full pr-12 text-base sm:text-sm"
                            autoComplete="new-password"
                        />
                        <button type="button" onClick={() => toggleVisibility('password')} className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800" aria-label={visibleFields.password ? 'Hide new password' : 'Show new password'} title={visibleFields.password ? 'Hide password' : 'Show password'}>
                            {visibleFields.password ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={visibleFields.password_confirmation ? 'text' : 'password'}
                            className="mt-1 block w-full pr-12 text-base sm:text-sm"
                            autoComplete="new-password"
                        />
                        <button type="button" onClick={() => toggleVisibility('password_confirmation')} className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800" aria-label={visibleFields.password_confirmation ? 'Hide confirm password' : 'Show confirm password'} title={visibleFields.password_confirmation ? 'Hide password' : 'Show password'}>
                            {visibleFields.password_confirmation ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transform transition duration-300 ease-out"
                        enterFrom="translate-x-2 opacity-0"
                        enterTo="translate-x-0 opacity-100"
                        leave="transform transition duration-200 ease-in"
                        leaveFrom="translate-x-0 opacity-100"
                        leaveTo="translate-x-2 opacity-0"
                    >
                        <p
                            role="status"
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                        >
                            <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            Password updated
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
