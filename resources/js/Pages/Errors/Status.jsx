import { Head, usePage } from '@inertiajs/react';

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
    const [title, message] = copy[status] || copy[500];
    const roleNames = auth?.user?.roles?.map((role) => role.name) || [];
    const safeUrl = roleNames.includes('principal') ? '/principal/dashboard'
        : roleNames.includes('teacher') ? '/teacher/dashboard'
            : roleNames.includes('student') ? '/student/dashboard' : '/';

    return (
        <>
            <Head title={`${status} · ${title}`} />
            <style>{`
                :root { color-scheme: light; } html.dark { color-scheme: dark; } .error-status-page { min-height:100vh; display:grid; place-items:center; position:relative; isolation:isolate; overflow:hidden; padding:24px; color:#1e293b; background:#f8fbff; font-family:Figtree,Inter,ui-sans-serif,system-ui,sans-serif; } html.dark .error-status-page { color:#edf3ff; background:#0b1220; } .error-status-orb { position:absolute; z-index:-1; width:300px; height:300px; border-radius:999px; opacity:.45; filter:blur(2px); animation:error-drift 11s ease-in-out infinite; } .error-status-orb.one { top:-100px; left:-100px; background:#a5b4fc; } .error-status-orb.two { right:-90px; bottom:-110px; background:#99f6e4; animation-delay:-5s; } html.dark .error-status-orb { opacity:.2; } .error-status-card { width:min(100%,660px); padding:clamp(30px,6vw,60px); text-align:center; border:1px solid rgba(148,163,184,.28); border-radius:32px; background:rgba(255,255,255,.86); box-shadow:0 28px 70px rgba(30,41,59,.16); backdrop-filter:blur(18px); } html.dark .error-status-card { border-color:rgba(148,163,184,.22); background:rgba(18,29,48,.88); } .error-status-logo { display:grid; place-items:center; width:92px; height:92px; margin:0 auto 22px; border-radius:28px; background:linear-gradient(135deg,rgba(255,255,255,.88),#eef2ff); box-shadow:0 14px 28px rgba(79,70,229,.15); animation:error-float 4s ease-in-out infinite; } html.dark .error-status-logo { background:linear-gradient(135deg,#1e293b,#172554); } .error-status-logo img { width:68px; height:68px; object-fit:contain; } .error-status-eyebrow { margin:0; color:#4f46e5; font-size:.76rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; } html.dark .error-status-eyebrow { color:#a5b4fc; } .error-status-code { margin:12px 0 4px; font-size:clamp(4.6rem,18vw,8.5rem); line-height:.9; font-weight:900; letter-spacing:-.09em; text-shadow:0 5px 0 rgba(79,70,229,.08); } .error-status-title { margin:18px 0 10px; font-size:clamp(1.65rem,4vw,2.35rem); letter-spacing:-.035em; } .error-status-message { max-width:470px; margin:0 auto; color:#5b6b82; font-size:clamp(1rem,2vw,1.1rem); line-height:1.7; } html.dark .error-status-message { color:#b4c1d5; } .error-status-button { display:inline-flex; align-items:center; justify-content:center; min-height:46px; margin-top:30px; padding:0 22px; border:0; border-radius:14px; color:#fff; background:linear-gradient(135deg,#4f46e5,#0ea5a4); box-shadow:0 10px 20px rgba(79,70,229,.2); font:inherit; font-weight:750; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease; } .error-status-button:hover { transform:translateY(-2px); box-shadow:0 14px 24px rgba(79,70,229,.25); } .error-status-button:focus-visible { outline:3px solid #93c5fd; outline-offset:3px; } @keyframes error-float { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-8px) rotate(2deg); } } @keyframes error-drift { 0%,100% { transform:translate(0,0); } 50% { transform:translate(26px,18px); } } @media (prefers-reduced-motion:reduce) { .error-status-page * { animation:none !important; transition:none !important; } }
            `}</style>
            <main className="error-status-page">
                <div className="error-status-orb one" aria-hidden="true" />
                <div className="error-status-orb two" aria-hidden="true" />
                <section className="error-status-card" aria-labelledby="error-status-title">
                    <div className="error-status-logo"><img src="/storage/images/studynestLogo.png" alt="StudyNest logo" /></div>
                    <p className="error-status-eyebrow">StudyNest · Error {status}</p>
                    <div className="error-status-code" aria-hidden="true">{status}</div>
                    <h1 id="error-status-title" className="error-status-title">{title}</h1>
                    <p className="error-status-message">{message}</p>
                    <button type="button" className="error-status-button" onClick={() => window.location.assign(safeUrl)}>← Go back</button>
                </section>
            </main>
        </>
    );
}
