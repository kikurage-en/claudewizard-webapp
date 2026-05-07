import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // テスト環境では常に空文字（復号なし）— promptLoader のテストで致命的エラーを再現
  define: {
    __LIGHT_SYSTEM_PROMPT_JA__: JSON.stringify(''),
    __LIGHT_SYSTEM_PROMPT_EN__: JSON.stringify(''),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        'node_modules/**',
        'src/test-setup.ts',
        'src/main.tsx',
        'src/styles/**',
        'src/analytics/**',
        'src/prompts/**',
        'src/ui/App.tsx',
        'src/ui/components/Header.tsx',
        'src/ui/components/Footer.tsx',
        'src/ui/pages/NotFoundPage.tsx',
        'src/ui/pages/PrivacyPage.tsx',
        'src/ui/pages/TermsPage.tsx',
        'src/ui/router/useRoute.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'e2e/**',
        '.claude/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
