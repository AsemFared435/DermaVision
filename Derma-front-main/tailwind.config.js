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
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundColor: {
        'dark-primary': '#1f2937',
        'dark-secondary': '#111827',
      },
      textColor: {
        'dark-primary': '#f9fafb',
        'dark-secondary': '#9ca3af',
      },
    },
  },
  plugins: [],
}