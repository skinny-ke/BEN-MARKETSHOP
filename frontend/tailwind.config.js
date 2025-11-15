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
        // Primary BenMarket Brand Colors
        primary: {
          DEFAULT: '#2563EB', // Blue-600 - Trust & Professional
          light: '#3B82F6',   // Blue-500
          dark: '#1D4ED8',    // Blue-700
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#16A34A', // Green-600 - Kenya, MPesa, Growth
          light: '#22C55E',   // Green-500
          dark: '#15803D',    // Green-700
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        accent: {
          DEFAULT: '#F97316', // Orange-500 - Retail urgency & offers
          light: '#FB923C',   // Orange-400
          dark: '#EA580C',    // Orange-600
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber-500 - Price tags, badges
          light: '#FBBF24',   // Amber-400
          dark: '#D97706',    // Amber-600
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Neutral Colors for Light Theme
        neutral: {
          50: '#F9FAFB',   // Light background
          100: '#F3F4F6',  // Very light background
          200: '#E5E7EB',  // Light borders
          300: '#D1D5DB',  // Medium borders
          400: '#9CA3AF',  // Subtle text
          500: '#6B7280',  // Secondary text
          600: '#4B5563',  // Primary text
          700: '#374151',  // Dark text
          800: '#1F2937',  // Very dark text
          900: '#111827',  // Headings
        },
        // Dark Mode Colors
        'dark-bg': {
          primary: '#0F172A',    // Deep navy-slate background
          secondary: '#1E293B',  // Card background
          tertiary: '#334155',   // Borders and lines
        },
        'dark-text': {
          primary: '#E2E8F0',    // Primary text in dark mode
          secondary: '#CBD5E1',  // Secondary text in dark mode
          muted: '#94A3B8',      // Muted text in dark mode
        },
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)',
        softDark: '0 4px 12px rgba(0,0,0,0.2)',
        card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        cardHover: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
