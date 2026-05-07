import { describe, it, expect } from 'vitest'
import { extractJson, parseLightOutput, ParseError } from '../parseClaudeOutput'

describe('extractJson', () => {
  it('通常の JSON 文字列をパースできる', () => {
    expect(extractJson('{"key":"value"}')).toEqual({ key: 'value' })
  })

  it('```json ``` ブロックを除去してパースできる', () => {
    const raw = '```json\n{"key":"value"}\n```'
    expect(extractJson(raw)).toEqual({ key: 'value' })
  })

  it('``` ``` ブロック（言語指定なし）を除去してパースできる', () => {
    const raw = '```\n{"key":"value"}\n```'
    expect(extractJson(raw)).toEqual({ key: 'value' })
  })

  it('前後の空白・改行を無視してパースできる', () => {
    expect(extractJson('  \n{"key":"value"}\n  ')).toEqual({ key: 'value' })
  })

  it('無効な JSON では ParseError をスロー', () => {
    expect(() => extractJson('not json')).toThrow(ParseError)
  })

  it('配列もパースできる', () => {
    expect(extractJson('[1,2,3]')).toEqual([1, 2, 3])
  })
})

describe('parseLightOutput', () => {
  const validPayload = JSON.stringify({
    claude_md: '# CLAUDE.md content',
    readme_md: '# README content',
    skill_md: '# SKILL.md content',
  })

  it('正常な JSON から LightOutputFiles を返す', () => {
    const result = parseLightOutput(validPayload)
    expect(result.claude_md).toBe('# CLAUDE.md content')
    expect(result.readme_md).toBe('# README content')
    expect(result.skill_md).toBe('# SKILL.md content')
  })

  it('コードブロック付きでもパースできる', () => {
    const raw = '```json\n' + validPayload + '\n```'
    const result = parseLightOutput(raw)
    expect(result.claude_md).toBe('# CLAUDE.md content')
  })

  it('claude_md が欠落していると ParseError をスロー', () => {
    const raw = JSON.stringify({ readme_md: 'a', skill_md: 'b' })
    expect(() => parseLightOutput(raw)).toThrow(ParseError)
  })

  it('トップレベルが配列の場合 ParseError をスロー', () => {
    expect(() => parseLightOutput('[]')).toThrow(ParseError)
  })

  it('フィールドが string でない場合 ParseError をスロー', () => {
    const raw = JSON.stringify({ claude_md: 123, readme_md: 'a', skill_md: 'b' })
    expect(() => parseLightOutput(raw)).toThrow(ParseError)
  })
})
