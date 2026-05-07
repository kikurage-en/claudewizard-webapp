import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted で宣言することで vi.mock factory 内で参照可能
const { mockCallClaude } = vi.hoisted(() => ({ mockCallClaude: vi.fn() }))

vi.mock('../../security/anthropicClient', () => ({
  callClaude: mockCallClaude,
  AnthropicClientError: class AnthropicClientError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.code = code
    }
  },
}))

vi.mock('../../security/promptLoader', () => ({
  getLightSystemPrompt: (lang: string) =>
    lang === 'ja' ? 'system prompt ja' : 'system prompt en',
}))

import { generateLight } from '../lightGenerator'

const VALID_API_RESPONSE = JSON.stringify({
  claude_md: '# CLAUDE.md',
  readme_md: '# README.md',
  skill_md: '# SKILL.md',
})

describe('generateLight', () => {
  beforeEach(() => {
    mockCallClaude.mockReset()
  })

  it('正常なレスポンスで Blob を返す', async () => {
    mockCallClaude.mockResolvedValue(VALID_API_RESPONSE)

    const blob = await generateLight('sk-ant-test', 'ja', {
      q1: 'software',
      q2: 'my-project',
      q3: 'create',
      q4: 'programming',
      q5: 'speed',
    })

    expect(blob).toBeInstanceOf(Blob)
  })

  it('callClaude が 1 回呼ばれる（正常時）', async () => {
    mockCallClaude.mockResolvedValue(VALID_API_RESPONSE)

    await generateLight('sk-ant-test', 'en', {
      q1: 'software',
      q2: 'test-project',
      q3: 'create',
      q4: 'cli',
      q5: 'quality',
    })

    expect(mockCallClaude).toHaveBeenCalledTimes(1)
  })

  it('パース失敗時に 2 回目を試みる', async () => {
    mockCallClaude
      .mockResolvedValueOnce('invalid json')
      .mockResolvedValueOnce(VALID_API_RESPONSE)

    const blob = await generateLight('sk-ant-test', 'ja', {
      q1: 'software',
      q2: 'my-project',
      q3: 'create',
      q4: 'programming',
      q5: 'speed',
    })

    expect(mockCallClaude).toHaveBeenCalledTimes(2)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('2 回ともパース失敗した場合 ParseError をスロー', async () => {
    mockCallClaude.mockResolvedValue('invalid json')

    await expect(
      generateLight('sk-ant-test', 'ja', {
        q1: 'software',
        q2: 'my-project',
        q3: 'create',
        q4: 'programming',
        q5: 'speed',
      })
    ).rejects.toThrow()
  })

  it('q6（備考・要望）がある場合もエラーなく動作する', async () => {
    mockCallClaude.mockResolvedValue(VALID_API_RESPONSE)

    const blob = await generateLight('sk-ant-test', 'ja', {
      q1: 'software',
      q2: 'my-project',
      q3: 'create',
      q4: 'programming',
      q5: 'speed',
      q6: 'TypeScript を中心にしてほしい',
    })

    expect(blob).toBeInstanceOf(Blob)
    const userMsg = mockCallClaude.mock.calls[0][2] as string
    expect(userMsg).toContain('TypeScript を中心にしてほしい')
  })
})
