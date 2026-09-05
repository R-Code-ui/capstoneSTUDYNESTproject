import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const copy = {
    401: ['Please sign in to continue', 'This page needs a signed-in StudyNest account.'],
    402: ['This feature needs attention', 'A payment or account requirement is needed before this page can be used.'],
    403: ['This space is not available to you', 'Your account does not have permission to open this page.'],
    404: ['We could not find that page', 'It may have moved, been removed, or the link may not be quite right.'],
    405: ['That action is not available', 'This page cannot be opened in that way. Please try the action again from the app.'],
    419: ['Your session needs a refresh', 'For your security, your session has expired. Please sign in again to continue.'],
    429: ['Let’s slow down for a moment', 'Too many requests were sent in a short time. Please wait, then try again.'],
    500: ['Something unexpected happened', 'We hit a small bump while loading this page. Please try again in a moment.'],
    502: ['We could not reach the service', 'StudyNest could not connect to a service it needs right now.'],
    503: ['StudyNest is taking a short break', 'The service is temporarily unavailable. Please check back soon.'],
    504: ['That took a little too long', 'The page did not respond in time. Please try again in a moment.'],
    505: ['This connection is not supported', 'Please try again with an updated browser.'],
};

export default function Status({ status = 500 }) {
    const { auth } = usePage().props;
    const [isDarkMode, setIsDarkMode] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );
    const [title, message] = copy[status] || copy[500];
    const roleNames = auth?.user?.roles?.map((role) => role.name) || [];
    const safeUrl = roleNames.includes('principal') ? '/principal/dashboard'
        : roleNames.includes('teacher') ? '/teacher/dashboard'
            : roleNames.includes('student') ? '/student/dashboard' : '/login';

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
        try {
            localStorage.setItem('studynest-theme', isDarkMode ? 'dark' : 'light');
        } catch {
            // The selected theme still applies for this page when storage is blocked.
        }
    }, [isDarkMode]);

    const getStoredInternalUrl = (key) => {
        try {
            const value = sessionStorage.getItem(key);
            if (!value) return null;
            const url = new URL(value, window.location.origin);
            return url.origin === window.location.origin && url.href !== window.location.href ? url.href : null;
        } catch {
            return null;
        }
    };

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.assign(getStoredInternalUrl('studynest-last-valid-url') || safeUrl);
    };

    return (
        <>
            <Head title={`${status} · ${title}`}>
                <meta name="theme-color" content={isDarkMode ? '#0f172a' : '#f8fafc'} />
            </Head>
            <style>{`
                :root { color-scheme: light; } html.dark { color-scheme: dark; } .error-status-page { min-height:100vh; display:grid; place-items:center; position:relative; isolation:isolate; overflow:hidden; padding:24px; color:#1e293b; background:#f8fbff; font-family:Figtree,Inter,ui-sans-serif,system-ui,sans-serif; } html.dark .error-status-page { color:#edf3ff; background:#0b1220; } .error-status-orb { position:absolute; z-index:-1; width:300px; height:300px; border-radius:999px; opacity:.45; filter:blur(2px); animation:error-drift 11s ease-in-out infinite; } .error-status-orb.one { top:-100px; left:-100px; background:#a5b4fc; } .error-status-orb.two { right:-90px; bottom:-110px; background:#99f6e4; animation-delay:-5s; } html.dark .error-status-orb { opacity:.2; } .error-status-card { width:min(100%,660px); padding:clamp(30px,6vw,60px); text-align:center; border:1px solid rgba(148,163,184,.28); border-radius:32px; background:rgba(255,255,255,.86); box-shadow:0 28px 70px rgba(30,41,59,.16); backdrop-filter:blur(18px); } html.dark .error-status-card { border-color:rgba(148,163,184,.22); background:rgba(18,29,48,.88); } .error-status-logo { display:grid; place-items:center; width:92px; height:92px; margin:0 auto 22px; border-radius:28px; background:linear-gradient(135deg,rgba(255,255,255,.88),#eef2ff); box-shadow:0 14px 28px rgba(79,70,229,.15); animation:error-float 4s ease-in-out infinite; } html.dark .error-status-logo { background:linear-gradient(135deg,#1e293b,#172554); } .error-status-logo img { width:68px; height:68px; object-fit:contain; } .error-status-eyebrow { margin:0; color:#4f46e5; font-size:.76rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; } html.dark .error-status-eyebrow { color:#a5b4fc; } .error-status-code { margin:12px 0 4px; font-size:clamp(4.6rem,18vw,8.5rem); line-height:.9; font-weight:900; letter-spacing:-.09em; text-shadow:0 5px 0 rgba(79,70,229,.08); } .error-status-title { margin:18px 0 10px; font-size:clamp(1.65rem,4vw,2.35rem); letter-spacing:-.035em; } .error-status-message { max-width:470px; margin:0 auto; color:#5b6b82; font-size:clamp(1rem,2vw,1.1rem); line-height:1.7; } html.dark .error-status-message { color:#b4c1d5; } .error-status-actions { display:flex; justify-content:center; flex-wrap:wrap; gap:12px; margin-top:30px; } .error-status-button { display:inline-flex; align-items:center; justify-content:center; min-height:46px; padding:0 22px; border:1px solid transparent; border-radius:14px; color:#fff; background:linear-gradient(135deg,#4f46e5,#0ea5a4); box-shadow:0 10px 20px rgba(79,70,229,.2); font:inherit; font-weight:750; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease,background-color .18s ease; } .error-status-button.secondary { color:#334155; border-color:rgba(148,163,184,.35); background:rgba(255,255,255,.62); box-shadow:none; } html.dark .error-status-button.secondary { color:#dbeafe; background:#1e293b; border-color:#475569; } .error-status-button:hover { transform:translateY(-2px); box-shadow:0 14px 24px rgba(79,70,229,.25); } .error-status-button.secondary:hover { box-shadow:0 10px 18px rgba(30,41,59,.12); } .error-status-button:focus-visible,.error-status-theme-toggle:focus-visible { outline:3px solid #93c5fd; outline-offset:3px; } .error-status-theme-toggle { position:fixed; top:20px; right:20px; display:grid; place-items:center; width:44px; height:44px; border:1px solid rgba(148,163,184,.3); border-radius:50%; color:inherit; background:rgba(255,255,255,.82); box-shadow:0 8px 20px rgba(30,41,59,.1); font-size:1.1rem; cursor:pointer; } html.dark .error-status-theme-toggle { background:#172033; border-color:#334155; } @keyframes error-float { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-8px) rotate(2deg); } } @keyframes error-drift { 0%,100% { transform:translate(0,0); } 50% { transform:translate(26px,18px); } } @media (max-width:480px) { .error-status-page { padding:16px; } .error-status-card { border-radius:26px; } .error-status-theme-toggle { top:14px; right:14px; } } @media (prefers-reduced-motion:reduce) { .error-status-page * { animation:none !important; transition:none !important; } }
            `}</style>
            <main className="error-status-page">
                <div className="error-status-orb one" aria-hidden="true" />
                <div className="error-status-orb two" aria-hidden="true" />
                <button type="button" className="error-status-theme-toggle" aria-label="Toggle color theme" title="Toggle color theme" onClick={() => setIsDarkMode((value) => !value)}>{isDarkMode ? '☀' : '☾'}</button>
                <section className="error-status-card" aria-labelledby="error-status-title">
                    <div className="error-status-logo"><img src="/storage/images/studynestLogo.png" alt="StudyNest logo" /></div>
                    <p className="error-status-eyebrow">StudyNest · Error {status}</p>
                    <div className="error-status-code" aria-hidden="true">{status}</div>
                    <h1 id="error-status-title" className="error-status-title">{title}</h1>
                    <p className="error-status-message">{message}</p>
                    <div className="error-status-actions">
                        <button type="button" className="error-status-button" onClick={goBack}>← Go back</button>
                        <button type="button" className="error-status-button secondary" onClick={() => window.location.assign(safeUrl)}>{auth?.user ? 'Dashboard' : 'Sign in'}</button>
                    </div>
                </section>
            </main>
        </>
    );
}
