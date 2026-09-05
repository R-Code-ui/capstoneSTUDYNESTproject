import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const lastValidPageKey = 'studynest-last-valid-url';

const rememberValidPage = (component, pageProps = {}) => {
    if (typeof window === 'undefined' || component?.startsWith('Errors/')) return;

    try {
        sessionStorage.setItem(lastValidPageKey, window.location.href);
        const roles = pageProps.auth?.user?.roles?.map((role) => role.name) || [];
        const dashboardUrl = roles.includes('principal') ? '/principal/dashboard'
            : roles.includes('teacher') ? '/teacher/dashboard'
                : roles.includes('student') ? '/student/dashboard' : '/login';
        sessionStorage.setItem('studynest-dashboard-url', dashboardUrl);
    } catch {
        // Storage may be unavailable in restricted browsing modes.
    }
};

router.on('success', (event) => rememberValidPage(event.detail.page.component, event.detail.page.props));

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        rememberValidPage(props.initialPage?.component, props.initialPage?.props);
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" richColors closeButton />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
