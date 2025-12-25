/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy custom colors from original app
        'grok-dark': '#0F0F0F',
        'grok-gray': '#2F2F2F',
        'grok-gray-hover': '#494949',
        'grok-light': '#F0F0F0',
        'grok-white': '#FFFFFF',

        // Dynamic theme colors (using CSS variables)
        'theme-bg-dark': 'var(--color-bg-dark)',
        'theme-bg-medium': 'var(--color-bg-medium)',
        'theme-bg-light': 'var(--color-bg-light)',
        'theme-text-primary': 'var(--color-text-primary)',
        'theme-text-secondary': 'var(--color-text-secondary)',
        'theme-text-hover': 'var(--color-text-hover)',
        'theme-shadow': 'var(--color-shadow)',
        'theme-border': 'var(--color-border)',
        'theme-success': 'var(--color-success)',
        'theme-danger': 'var(--color-danger)',
        'theme-progress-bar': 'var(--color-progress-bar)',
        'theme-glow-primary': 'var(--color-glow-primary)',
        'theme-glow-secondary': 'var(--color-glow-secondary)',
        'theme-glow-hover-primary': 'var(--color-glow-hover-primary)',
        'theme-glow-hover-secondary': 'var(--color-glow-hover-secondary)',
      },
    },
  },
  plugins: [],
}
