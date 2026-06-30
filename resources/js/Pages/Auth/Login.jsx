import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '', // Changed from 'email' to 'username'
        password: '',
        remember: false,
    });

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
                <div className="mb-5 rounded-xl bg-green-50/60 p-4 text-sm font-medium text-green-600 border border-green-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="username" value="Username / LRN / Teacher ID / Principal ID" />

                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder="Enter your LRN, Teacher ID, or Principal ID"
                    />

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-[#434343] font-medium">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm font-semibold text-[#1C56A6] hover:text-[#22486A] focus:outline-none focus:ring-2 focus:ring-[#5EC4D2] transition duration-150"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3 text-sm" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>

                {/* Styled structural hints section */}
                <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-3 gap-2 text-center text-[11px] font-bold tracking-wide text-[#434343]/80 uppercase">
                    <div className="bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
                        <span className="block text-[#1C56A6]">Students</span>
                        <span className="text-[10px] text-neutral-400 font-medium normal-case block mt-0.5">Use LRN</span>
                    </div>
                    <div className="bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
                        <span className="block text-[#1C56A6]">Teachers</span>
                        <span className="text-[10px] text-neutral-400 font-medium normal-case block mt-0.5">Teacher ID</span>
                    </div>
                    <div className="bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
                        <span className="block text-[#1C56A6]">Principal</span>
                        <span className="text-[10px] text-neutral-400 font-medium normal-case block mt-0.5">Principal ID</span>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
