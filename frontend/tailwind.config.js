/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf5',
          100: '#c5d0e4',
          200: '#9fb0d0',
          300: '#7890bc',
          400: '#5a77ad',
          500: '#3d5e9e',
          600: '#2d4a85',
          700: '#1f3568',
          800: '#0D1E35',
          900: '#0A1628',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#f9eccf',
          200: '#f4dca8',
          300: '#eec97e',
          400: '#e8b960',
          500: '#D4A942',
          600: '#b08a2e',
          700: '#8a6a1e',
          800: '#664e12',
          900: '#42330a',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      }
    }
  },
  plugins: []
}
