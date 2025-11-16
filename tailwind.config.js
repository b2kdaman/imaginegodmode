/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from original app
        'grok-dark': '#0F0F0F',
        'grok-gray': '#2F2F2F',
        'grok-gray-hover': '#494949',
        'grok-light': '#F0F0F0',
        'grok-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
