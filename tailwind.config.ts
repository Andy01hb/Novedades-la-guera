import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#E91E8C',
          light: '#FF6BB3',
        },
        yellow: {
          DEFAULT: '#FFCA28',
        },
        dark: {
          DEFAULT: '#1a1a2e',
          card: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
        },
        cream: '#FFF5FA',
        admin: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        pink: '0 4px 20px rgba(233, 30, 140, 0.25)',
        'pink-lg': '0 8px 40px rgba(233, 30, 140, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
