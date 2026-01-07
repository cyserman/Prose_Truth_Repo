import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Truth Repo brand colors
                truth: {
                    primary: '#1e40af',    // Deep blue
                    secondary: '#3b82f6',  // Bright blue
                    accent: '#60a5fa',     // Light blue
                    dark: '#1e293b',       // Slate dark
                    light: '#f1f5f9',      // Slate light
                },
                // Event type colors
                event: {
                    pfa: '#dc2626',          // Red
                    custody: '#2563eb',      // Blue
                    court: '#7c3aed',        // Purple
                    communication: '#059669', // Green
                    financial: '#10b981',    // Emerald
                    housing: '#f59e0b',      // Amber
                    vehicle: '#ea580c',      // Orange
                    other: '#64748b',        // Slate
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
        },
    },
    plugins: [],
} satisfies Config
