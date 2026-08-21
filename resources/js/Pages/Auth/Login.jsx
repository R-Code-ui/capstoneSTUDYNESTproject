import Checkbox from '@/Components/Checkbox';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 border border-emerald-200/60 shadow-sm flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="username" value="Username" />

                    <div className="mt-1.5">
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                        />
                    </div>

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <div className="relative mt-1.5">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-20"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((previous) => !previous)}
                            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-slate-200 dark:hover:bg-slate-700/70 dark:hover:text-white dark:focus:ring-white/30"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2.5 text-xs sm:text-sm text-slate-700 font-semibold group-hover:text-slate-900 transition">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-lg text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3.5 text-sm" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>

            </form>
        </GuestLayout>
    );
}
