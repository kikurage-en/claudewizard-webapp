/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF5EB',
          alt: '#FBF6EB',
          peach: '#FFF6F0',
        },
        ink: {
          DEFAULT: '#2A1F17',
          muted: '#6B5D4F',
          faint: '#C9BBA9',
        },
        line: {
          faint: '#E6DECF',
          strong: '#3A2E24',
        },
        orange: {
          DEFAULT: '#D97757',
          dark: '#C2643F',
        },
        'dark-card': {
          DEFAULT: '#2A1F17',
          divider: '#4A3D30',
          surface: '#F5EFE2',
        },
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', 'system-ui', 'sans-serif'],
        body: ['"Zen Kaku Gothic New"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        'card-sm': '10px',
        btn: '8px',
      },
    },
  },
  plugins: [],
}
