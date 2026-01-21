/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Telegram-inspired color palette
                primary: {
                    50: '#e6f4ff',
                    100: '#bae3ff',
                    200: '#7cc4fa',
                    300: '#47a5f5',
                    400: '#2196F3',
                    500: '#0088cc',
                    600: '#0077b5',
                    700: '#006699',
                    800: '#005580',
                    900: '#003d5c',
                },
                dark: {
                    50: '#4a5568',
                    100: '#2d3748',
                    200: '#1a202c',
                    300: '#171923',
                    400: '#0f1419',
                    500: '#0a0c0f',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-subtle': 'bounce 1s ease-in-out 3',
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
