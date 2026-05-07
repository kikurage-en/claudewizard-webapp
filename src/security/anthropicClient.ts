import Anthropic, { APIError } from '@anthropic-ai/sdk'

export type AnthropicMessage = {
  role: 'user' | 'assistant'
  content: string
}

export class AnthropicClientError extends Error {
  constructor(
    message: string,
    public readonly code: 'auth' | 'rate_limit' | 'server' | 'timeout' | 'cors' | 'unknown'
  ) {
    super(message)
    this.name = 'AnthropicClientError'
  }
}

function buildClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'anthropic-dangerous-direct-browser-access': 'true',
    },
  })
}

export async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 8192
): Promise<string> {
  const client = buildClient(apiKey)

  let response: Awaited<ReturnType<typeof client.messages.create>>
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
  } catch (err) {
    throw mapError(err)
  }

  const block = response.content[0]
  if (block.type !== 'text') throw new AnthropicClientError('Unexpected response type', 'unknown')
  return block.text
}

function mapError(err: unknown): AnthropicClientError {
  if (err instanceof APIError) {
    if (err.status === 401) return new AnthropicClientError(err.message, 'auth')
    if (err.status === 429) return new AnthropicClientError(err.message, 'rate_limit')
    if (err.status === 500 || err.status === 503)
      return new AnthropicClientError(err.message, 'server')
    return new AnthropicClientError(err.message, 'unknown')
  }
  if (err instanceof Error) {
    if (err.name === 'AbortError' || err.message.includes('timeout'))
      return new AnthropicClientError(err.message, 'timeout')
    if (err.message.includes('CORS') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))
      return new AnthropicClientError(err.message, 'cors')
  }
  return new AnthropicClientError(String(err), 'unknown')
}
