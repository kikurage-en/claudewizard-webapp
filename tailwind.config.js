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
          // hover はインタラクション用（デザイン README）、deep は影・破線・押し込み CTA 用（final-variants FV_ORANGE_D）
          hover: '#C2643F',
          deep: '#B8573D',
        },
        danger: {
          // エラーバナー配色（デザイン正: wf-static-errors.jsx。fatal=DEFAULT / auto_recovery=soft）
          DEFAULT: '#C97050',
          soft: '#D9A060',
        },
        'dark-card': {
          DEFAULT: '#2A1F17',
          divider: '#4A3D30',
          surface: '#F5EFE2',
        },
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        'card-sm': '10px',
        btn: '8px',
      },
      boxShadow: {
        // final-variants.jsx のオフセット影体系（任意値クラスの散在を防ぐ）
        'offset-orange': '4px 4px 0 #D97757',
        'offset-orange-sm': '3px 3px 0 #D97757',
        'offset-orange-lg': '6px 6px 0 #D97757',
        'offset-ink': '6px 6px 0 #2A1F17',
        'offset-ink-sm': '3px 3px 0 #2A1F17',
        'offset-line': '4px 4px 0 #E6DECF',
        'cta-down': '0 3px 0 #B8573D',
      },
    },
  },
  plugins: [],
}
