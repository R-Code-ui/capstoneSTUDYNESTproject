<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#f8fafc">

        <script>
            (() => {
                try {
                    const isDark = localStorage.getItem('studynest-theme') === 'dark';
                    document.documentElement.classList.toggle('dark', isDark);
                    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', isDark ? '#0f172a' : '#f8fafc');
                } catch {
                    document.documentElement.style.colorScheme = 'light';
                }
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
