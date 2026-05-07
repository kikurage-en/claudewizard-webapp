import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { execSync } from 'child_process'
import { existsSync } from 'fs'

function decryptEncFile(encFilePath: string, key: string): string {
  if (!existsSync(encFilePath)) return ''
  try {
    return execSync(
      `openssl enc -aes-256-cbc -d -a -salt -pbkdf2 -in "${encFilePath}" -pass pass:"${key}" 2>/dev/null`,
      { encoding: 'utf8' }
    ).trim()
  } catch {
    return ''
  }
}

export default defineConfig(({ mode }) => {
  // .env.local / .env からも自動読み込み（process.env.VITE_PROMPT_ENCRYPTION_KEY を上書きしない）
  const env = loadEnv(mode, process.cwd(), '')

  // テストモードではプロンプトを空にする（promptLoader のテストで確定的な挙動にするため）
  const key =
    mode === 'test'
      ? ''
      : process.env.VITE_PROMPT_ENCRYPTION_KEY || env.VITE_PROMPT_ENCRYPTION_KEY || ''

  const lightPromptJa = key ? decryptEncFile('src/prompts/light_ja.enc', key) : ''
  const lightPromptEn = key ? decryptEncFile('src/prompts/light_en.enc', key) : ''

  // GitHub Actions の GITHUB_REPOSITORY からリポジトリ名を抽出して base に設定
  // 公開リポジトリ（kikurage-en/claudewizard-webapp）→ '/claudewizard-webapp/'
  // ローカル開発（dev / preview / test）→ '/'
  // VITE_BASE_PATH 明示指定があればそれを優先（手動上書き用）
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const base = process.env.VITE_BASE_PATH || (repoName ? `/${repoName}/` : '/')

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    define: {
      __LIGHT_SYSTEM_PROMPT_JA__: JSON.stringify(lightPromptJa),
      __LIGHT_SYSTEM_PROMPT_EN__: JSON.stringify(lightPromptEn),
    },
  }
})
