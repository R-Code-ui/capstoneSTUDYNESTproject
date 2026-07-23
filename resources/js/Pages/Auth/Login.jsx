import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
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
                <div className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 border border-emerald-200/60 shadow-sm flex items-center gap-2">
                    <span>✨</span>
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="username" value="Username / Student ID / Teacher ID / Principal ID" />

                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="mt-1.5 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder="Enter Student ID, Teacher ID, or Principal ID"
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
                        className="mt-1.5 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

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
                            className="rounded-lg text-xs sm:text-sm font-bold text-[#FF6B6B] hover:text-[#FF5252] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition"
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

                {/* Role Guidance Badges */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#E0F2F1] p-2.5 rounded-2xl border border-[#B2DFDB] transition hover:scale-[1.02]">
                        <span className="block text-xs font-black text-[#009688]">Students</span>
                        <span className="text-[10px] text-slate-600 font-medium block mt-0.5">Use Student ID</span>
                    </div>
                    <div className="bg-[#FFF3E0] p-2.5 rounded-2xl border border-[#FFE0B2] transition hover:scale-[1.02]">
                        <span className="block text-xs font-black text-[#FF9800]">Teachers</span>
                        <span className="text-[10px] text-slate-600 font-medium block mt-0.5">Teacher ID</span>
                    </div>
                    <div className="bg-[#F3E5F5] p-2.5 rounded-2xl border border-[#E1BEE7] transition hover:scale-[1.02]">
                        <span className="block text-xs font-black text-[#9C27B0]">Principal</span>
                        <span className="text-[10px] text-slate-600 font-medium block mt-0.5">Principal ID</span>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
