import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF8',
          100: '#FAF7F2',
          200: '#F3ECE1',
          300: '#E7DAC6',
        },
        chili: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#651616',
        },
        amberwarm: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        charcoal: {
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -2px rgba(41, 37, 36, 0.06), 0 1px 3px -1px rgba(41, 37, 36, 0.04)',
        'warm-md': '0 10px 25px -5px rgba(41, 37, 36, 0.08), 0 4px 10px -4px rgba(41, 37, 36, 0.04)',
        'warm-lg': '0 20px 40px -12px rgba(185, 28, 28, 0.14), 0 8px 16px -8px rgba(41, 37, 36, 0.08)',
      },
    },
  },
}
