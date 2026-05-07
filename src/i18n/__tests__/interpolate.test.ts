import { describe, it, expect } from 'vitest'
import { interpolate, selectPlural } from '../interpolate'

describe('interpolate', () => {
  it('returns template as-is when no vars', () => {
    expect(interpolate('Hello world')).toBe('Hello world')
  })

  it('replaces single placeholder', () => {
    expect(interpolate('Hello {{name}}', { name: 'Alice' })).toBe('Hello Alice')
  })

  it('replaces multiple placeholders', () => {
    expect(interpolate('{{a}} and {{b}}', { a: '1', b: '2' })).toBe('1 and 2')
  })

  it('leaves unknown placeholder as-is', () => {
    expect(interpolate('Hello {{unknown}}', { name: 'Alice' })).toBe('Hello {{unknown}}')
  })

  it('handles numeric values', () => {
    expect(interpolate('Count: {{count}}', { count: 5 })).toBe('Count: 5')
  })
})

describe('selectPlural', () => {
  const translations = {
    file: 'file',
    file_one: 'file',
    file_other: 'files',
  }

  it('returns _one form for count=1 in English', () => {
    expect(selectPlural(translations, 'file', 1, 'en')).toBe('file')
  })

  it('returns _other form for count≠1 in English', () => {
    expect(selectPlural(translations, 'file', 2, 'en')).toBe('files')
    expect(selectPlural(translations, 'file', 0, 'en')).toBe('files')
  })

  it('returns base key for Japanese regardless of count', () => {
    expect(selectPlural(translations, 'file', 1, 'ja')).toBe('file')
    expect(selectPlural(translations, 'file', 5, 'ja')).toBe('file')
  })

  it('falls back to base key when _one/_other not defined', () => {
    const t = { item: 'item' }
    expect(selectPlural(t, 'item', 1, 'en')).toBe('item')
    expect(selectPlural(t, 'item', 5, 'en')).toBe('item')
  })
})
