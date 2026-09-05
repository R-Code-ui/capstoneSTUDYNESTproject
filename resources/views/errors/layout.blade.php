<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f8fbff">
    <title>{{ $status }} · {{ $title }} | StudyNest</title>
    <script>
        (() => {
            try {
                if (localStorage.getItem('studynest-theme') === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0b1220');
                }
            } catch {}
        })();
    </script>
    <style>
        :root { color-scheme: light; --canvas: #f8fbff; --ink: #1e293b; --muted: #5b6b82; --card: rgba(255,255,255,.86); --border: rgba(148,163,184,.28); --accent: #4f46e5; --accent-2: #0ea5a4; --soft: #eef2ff; }
        .dark { color-scheme: dark; --canvas: #0b1220; --ink: #edf3ff; --muted: #b4c1d5; --card: rgba(18,29,48,.88); --border: rgba(148,163,184,.22); --accent: #a5b4fc; --accent-2: #5eead4; --soft: #172554; }
        * { box-sizing: border-box; }
        body { min-height: 100vh; margin: 0; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: Figtree, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .page { min-height: 100vh; display: grid; place-items: center; position: relative; padding: 24px; isolation: isolate; overflow: hidden; }
        .orb { position: absolute; z-index: -1; border-radius: 999px; filter: blur(2px); opacity: .45; animation: drift 11s ease-in-out infinite; }
        .orb-one { width: 310px; height: 310px; top: -110px; left: -100px; background: #a5b4fc; }
        .orb-two { width: 270px; height: 270px; right: -80px; bottom: -105px; background: #99f6e4; animation-delay: -5s; }
        .dark .orb { opacity: .2; }
        .error-card { width: min(100%, 660px); text-align: center; padding: clamp(30px, 6vw, 60px); border: 1px solid var(--border); border-radius: 32px; background: var(--card); box-shadow: 0 28px 70px rgba(30,41,59,.16); backdrop-filter: blur(18px); }
        .brand { display: inline-flex; align-items: center; justify-content: center; width: 92px; height: 92px; margin-bottom: 22px; border-radius: 28px; background: linear-gradient(135deg, rgba(255,255,255,.88), var(--soft)); box-shadow: 0 14px 28px rgba(79,70,229,.15); animation: logo-float 4s ease-in-out infinite; }
        .brand img { width: 68px; height: 68px; object-fit: contain; }
        .eyebrow { margin: 0; color: var(--accent); font-size: .76rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
        .status { margin: 12px 0 4px; font-size: clamp(4.6rem, 18vw, 8.5rem); line-height: .9; font-weight: 900; letter-spacing: -.09em; color: var(--ink); text-shadow: 0 5px 0 rgba(79,70,229,.08); }
        h1 { margin: 18px 0 10px; font-size: clamp(1.65rem, 4vw, 2.35rem); letter-spacing: -.035em; }
        .message { max-width: 470px; margin: 0 auto; color: var(--muted); font-size: clamp(1rem, 2vw, 1.1rem); line-height: 1.7; }
        .actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
        .button { appearance: none; display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 20px; border: 1px solid transparent; border-radius: 14px; color: white; background: linear-gradient(135deg, #4f46e5, #0ea5a4); box-shadow: 0 10px 20px rgba(79,70,229,.2); font: inherit; font-weight: 750; text-decoration: none; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
        .button.secondary { border-color: var(--border); color: var(--ink); background: transparent; box-shadow: none; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 14px 24px rgba(79,70,229,.25); }
        .button.secondary:hover { background: var(--soft); box-shadow: none; }
        .theme-toggle { position: fixed; top: 20px; right: 20px; display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 50%; color: var(--ink); background: var(--card); font-size: 1.1rem; cursor: pointer; box-shadow: 0 8px 20px rgba(30,41,59,.1); }
        .theme-toggle:focus-visible, .button:focus-visible { outline: 3px solid #93c5fd; outline-offset: 3px; }
        @keyframes logo-float { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        @keyframes drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(26px, 18px); } }
        @media (max-width: 480px) { .page { padding: 16px; } .error-card { border-radius: 26px; } .brand { width: 78px; height: 78px; margin-bottom: 18px; } .brand img { width: 58px; height: 58px; } .theme-toggle { top: 14px; right: 14px; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }
    </style>
</head>
<body>
    <main class="page">
        <div class="orb orb-one" aria-hidden="true"></div>
        <div class="orb orb-two" aria-hidden="true"></div>
        <button class="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle color theme" onclick="toggleTheme()">☾</button>
        <section class="error-card" aria-labelledby="error-title">
            <div class="brand"><img src="{{ asset('storage/images/studynestLogo.png') }}" alt="StudyNest logo"></div>
            <p class="eyebrow">StudyNest · Error {{ $status }}</p>
            <div class="status" aria-hidden="true">{{ $status }}</div>
            <h1 id="error-title">{{ $title }}</h1>
            <p class="message">{{ $message }}</p>
            <div class="actions">
                <button type="button" class="button" onclick="goBack()">&larr; Go back</button>
                <button type="button" id="safe-destination-button" class="button secondary" onclick="goToSafeDestination()">Dashboard</button>
            </div>
        </section>
    </main>
    <script>
        const updateThemeButton = () => document.querySelector('.theme-toggle').textContent = document.documentElement.classList.contains('dark') ? '☀' : '☾';
        const toggleTheme = () => {
            const dark = document.documentElement.classList.toggle('dark');
            try { localStorage.setItem('studynest-theme', dark ? 'dark' : 'light'); } catch {}
            document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0b1220' : '#f8fbff');
            updateThemeButton();
        };
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
        const getSafeDestination = () => getStoredInternalUrl('studynest-dashboard-url') || @json(url('/login'));
        const goBack = () => {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }

            window.location.assign(getStoredInternalUrl('studynest-last-valid-url') || getSafeDestination());
        };
        const goToSafeDestination = () => window.location.assign(getSafeDestination());
        document.querySelector('#safe-destination-button').textContent = getSafeDestination().endsWith('/login') ? 'Sign in' : 'Dashboard';
        updateThemeButton();
    </script>
</body>
</html>
