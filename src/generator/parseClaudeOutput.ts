export class ParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

/**
 * Claude のレスポンスからマークダウンコードブロックを除去して JSON を抽出する。
 * 要件定義書 §4.4 #1 の堅牢パース要件に対応。
 */
export function extractJson(raw: string): unknown {
  let text = raw.trim()

  // マークダウンコードブロック (```json ... ``` or ``` ... ```) を除去
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/)
  if (fenceMatch) {
    text = fenceMatch[1].trim()
  }

  // 先頭・末尾の余分な空白・改行を除去
  text = text.trim()

  try {
    return JSON.parse(text)
  } catch {
    throw new ParseError(`JSON parse failed. Raw snippet: ${text.slice(0, 200)}`)
  }
}

export type LightOutputFiles = {
  claude_md: string
  readme_md: string
  skill_md: string
}

export function parseLightOutput(raw: string): LightOutputFiles {
  const parsed = extractJson(raw)

  if (typeof parsed !== 'object' || parsed === null) {
    throw new ParseError('Expected object at top level')
  }

  const obj = parsed as Record<string, unknown>

  for (const key of ['claude_md', 'readme_md', 'skill_md'] as const) {
    if (typeof obj[key] !== 'string') {
      throw new ParseError(`Missing or non-string field: ${key}`)
    }
  }

  return {
    claude_md: obj['claude_md'] as string,
    readme_md: obj['readme_md'] as string,
    skill_md: obj['skill_md'] as string,
  }
}
