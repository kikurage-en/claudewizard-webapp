import { describe, it, expect } from 'vitest'
import { getLightSystemPrompt, getPlusSystemPrompt } from '../promptLoader'

// テストモードでは vitest.config.ts が __*_SYSTEM_PROMPT_*__ を空文字に固定するため、
// 各 getter は致命的エラーを投げる（要件定義書 §20.2「Prompt 復号」の致命的エラー再現）
describe('getLightSystemPrompt', () => {
  it('プロンプト未復号（空文字）の場合にエラーをスロー', () => {
    expect(() => getLightSystemPrompt('ja')).toThrow('System prompt')
    expect(() => getLightSystemPrompt('en')).toThrow('System prompt')
  })
})

describe('getPlusSystemPrompt', () => {
  it('プロンプト未provision（空文字）の場合にエラーをスロー', () => {
    expect(() => getPlusSystemPrompt('ja')).toThrow('Plus system prompt')
    expect(() => getPlusSystemPrompt('en')).toThrow('Plus system prompt')
  })
})
