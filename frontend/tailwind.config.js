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
        canvas: '#f4f5f7',
        surface: '#ffffff',
        borderLight: '#e3e6eb',
        primaryDark: '#15171c',
        mutedGray: '#6b7382',
        accentBlue: '#2b59ff',
        accentCoral: '#e5484d',
        accentEmerald: '#10b981',
        brand: {
          50: '#f4f6ff',
          100: '#e8ecff',
          200: '#d5dcff',
          300: '#b4c0ff',
          400: '#8999ff',
          500: '#5c6cff',
          600: '#2b59ff',
          700: '#1e40eb',
          800: '#1b34be',
          900: '#1b3195',
          950: '#15171c',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'framer': '0px 0.6px 1.5px -1.5px rgba(0, 0, 0, 0.08), 0px 2.3px 6px -3px rgba(0, 0, 0, 0.06), 0px 10px 26px -4.5px rgba(0, 0, 0, 0.03)',
        'framer-hover': '0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 8px 16px -4px rgba(0, 0, 0, 0.08), 0px 20px 40px -8px rgba(0, 0, 0, 0.04)',
        'glow-sm': '0 0 16px -2px rgba(43, 89, 255, 0.35)',
        'glow-lg': '0 0 30px -4px rgba(43, 89, 255, 0.5)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.88)' },
          '70%': { transform: 'scale(1.03)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.985)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 16px -2px rgba(43, 89, 255, 0.35)' },
          '50%': { boxShadow: '0 0 28px 2px rgba(43, 89, 255, 0.6)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'floatSlow 4s ease-in-out infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow': 'glowPulse 3s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'marquee': 'marquee 30s linear infinite',
        'gradient-x': 'gradientX 6s ease infinite',
      }
    },
  },
  plugins: [],
}
