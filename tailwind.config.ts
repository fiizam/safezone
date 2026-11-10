import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06090e',
          900: '#0b0f19',
          850: '#101624',
          800: '#151d30',
          700: '#1e293b',
          600: '#334155'
        },
        safe: {
          50: '#ecfdf5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b'
        },
        danger: {
          50: '#fef2f2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d'
        },
        warning: {
          50: '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-danger': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'glow-safe': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-warning': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
      }
    }
  },
  plugins: []
}
