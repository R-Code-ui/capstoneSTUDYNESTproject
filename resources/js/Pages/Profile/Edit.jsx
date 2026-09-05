import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

        window.setTimeout(() => {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }, 150);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="profile-page py-6 pb-[max(8rem,env(safe-area-inset-bottom))] sm:py-12" onFocusCapture={keepFocusedFieldVisible}>
                <style>{`
                    .profile-page { scroll-padding-bottom: max(9rem, env(safe-area-inset-bottom)); }
                    .profile-page input, .profile-page select, .profile-page textarea { scroll-margin-block: 7rem; }
                    @media (max-width: 639px) {
                        .profile-page input:not([type="checkbox"]), .profile-page select, .profile-page textarea { font-size: 16px; }
                    }
                `}</style>
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
