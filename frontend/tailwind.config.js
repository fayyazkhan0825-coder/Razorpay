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
        primary: {
          DEFAULT: '#6C3BFF',
          dark: '#542BD6',
          light: '#ECE7FF',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          light: '#EDE9FE',
        },
        bg: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1E293B',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        darkGray: '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(108, 59, 255, 0.06), 0 2px 12px -2px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 12px 30px -3px rgba(108, 59, 255, 0.15), 0 6px 20px -3px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
