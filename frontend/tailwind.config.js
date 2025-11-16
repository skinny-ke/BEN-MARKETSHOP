/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          dark: '#1D4ED8',   // blue-700 (dark mode or bold variant)
          focus: '#1E40AF',  // blue-800,
        },
        green: {
          DEFAULT: '#16A34A', // strong Kenyan green
          light: '#22C55E',   // fresh green
        },
        orange: {
          DEFAULT: '#F97316',
        },
        gold: {
          DEFAULT: '#F59E0B',
        },
        amber: {
          DEFAULT: '#F59E0B',
        },
        background: {
          light: '#F9FAFB',
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
          cardLight: '#FFFFFF',
          cardDark: '#1E293B',
        },
        surface: {
          dark: '#1E293B',
          light: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1F2937',
          secondary: '#374151',
          dark: '#E2E8F0',
        },
        border: {
          dark: '#334155',
          light: '#E5E7EB',
        },
        accent: {
          DEFAULT: '#F97316', // Orange
        },
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
