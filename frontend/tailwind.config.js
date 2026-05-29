/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* --- Neutral surface tokens --- */
        bg:           'var(--color-bg)',
        'bg-subtle':  'var(--color-bg-subtle)',
        surface:      'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        border:       'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        muted:        'var(--color-muted)',
        fg:           'var(--color-fg)',

        /* --- Accent --- */
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
          bg:      'var(--color-accent-bg)',
          text:    'var(--color-accent-text)',
        },

        /* --- Status --- */
        issued:    { DEFAULT: 'var(--color-issued)',    bg: 'var(--color-issued-bg)' },
        draft:     { DEFAULT: 'var(--color-draft)',     bg: 'var(--color-draft-bg)' },
        cancelled: { DEFAULT: 'var(--color-cancelled)', bg: 'var(--color-cancelled-bg)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', '0.875rem'],
      },
      borderRadius: {
        card:  '0.875rem',
        input: '0.5rem',
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        'card-md':'0 4px 8px -2px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.04)',
        'card-lg':'0 10px 20px -4px rgba(0,0,0,.10), 0 4px 6px -4px rgba(0,0,0,.05)',
        inset:   'inset 0 1px 2px 0 rgba(0,0,0,.05)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'zoom-in-95': {
          '0%':   { opacity: '0', transform: 'scale(.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 200ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'in':       'zoom-in-95 150ms ease-out',
      },
    },
  },
  plugins: [],
}
