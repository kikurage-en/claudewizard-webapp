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
    __PLUS_SYSTEM_PROMPT_JA__: JSON.stringify(''),
    __PLUS_SYSTEM_PROMPT_EN__: JSON.stringify(''),
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
      reportsDirectory: 'coverage',
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
      // vitest 4 の coverage-v8 は ast-aware remapping で statements/branches を
      // より正確に（= 低めに）計測する。旧 vitest 1 の数値（~94%）は過大計測だった。
      // 152 tests は不変のまま実測値のみ低下したため、実測の約 2pt 下に閾値を再調整。
      // 実測（2026-06）: statements 78.28 / branches 72.13 / functions 85.54 / lines 80.44
      thresholds: {
        lines: 78,
        functions: 82,
        branches: 70,
        statements: 75,
      },
    },
  },
})
