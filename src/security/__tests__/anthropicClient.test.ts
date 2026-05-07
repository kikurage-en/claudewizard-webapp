import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callClaude, AnthropicClientError } from '../anthropicClient'

// vi.mock factory 内では "mock" プレフィックス変数は hoisting 後でも参照可能
const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  class MockAPIError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
      this.name = 'APIError'
    }
  }

  return {
    default: class MockAnthropic {
      messages = { create: mockCreate }
      static APIError = MockAPIError
    },
    APIError: MockAPIError,
  }
})

describe('callClaude', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('正常レスポンスのテキストを返す', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'hello world' }],
    })

    const result = await callClaude('sk-ant-test', 'system', 'user')
    expect(result).toBe('hello world')
  })

  it('401 エラーは auth コードで AnthropicClientError をスロー', async () => {
    const { APIError } = await import('@anthropic-ai/sdk')
    mockCreate.mockRejectedValue(
      new (APIError as unknown as new (status: number, msg: string) => Error)(401, 'Unauthorized')
    )

    await expect(callClaude('bad-key', 'system', 'user')).rejects.toMatchObject({
      name: 'AnthropicClientError',
      code: 'auth',
    })
  })

  it('429 エラーは rate_limit コードで AnthropicClientError をスロー', async () => {
    const { APIError } = await import('@anthropic-ai/sdk')
    mockCreate.mockRejectedValue(
      new (APIError as unknown as new (status: number, msg: string) => Error)(429, 'Too Many Requests')
    )

    await expect(callClaude('sk-ant-test', 'system', 'user')).rejects.toMatchObject({
      code: 'rate_limit',
    })
  })

  it('500 エラーは server コードで AnthropicClientError をスロー', async () => {
    const { APIError } = await import('@anthropic-ai/sdk')
    mockCreate.mockRejectedValue(
      new (APIError as unknown as new (status: number, msg: string) => Error)(500, 'Internal Server Error')
    )

    await expect(callClaude('sk-ant-test', 'system', 'user')).rejects.toMatchObject({
      code: 'server',
    })
  })

  it('"Failed to fetch" エラーは cors コードで AnthropicClientError をスロー', async () => {
    mockCreate.mockRejectedValue(new Error('Failed to fetch'))

    await expect(callClaude('sk-ant-test', 'system', 'user')).rejects.toMatchObject({
      code: 'cors',
    })
  })

  it('AnthropicClientError は Error のサブクラス', async () => {
    const err = new AnthropicClientError('test', 'auth')
    expect(err).toBeInstanceOf(Error)
    expect(err.code).toBe('auth')
  })
})
