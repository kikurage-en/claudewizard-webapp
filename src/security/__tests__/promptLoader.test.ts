import { describe, it, expect } from 'vitest'
import { getLightSystemPrompt } from '../promptLoader'

// テストモードでは vite.config.ts が VITE_PROMPT_ENCRYPTION_KEY を無視するため、
// __LIGHT_SYSTEM_PROMPT_*__ は空文字に確定する（要件定義書 §20.2「Prompt 復号」の致命的エラー再現）
describe('getLightSystemPrompt', () => {
  it('プロンプト未復号（空文字）の場合にエラーをスロー', () => {
    expect(() => getLightSystemPrompt('ja')).toThrow('System prompt')
    expect(() => getLightSystemPrompt('en')).toThrow('System prompt')
  })
})
