import { describe, it, expect } from 'vitest'
import { render, UndefinedVariableError } from '../render'

describe('render', () => {
  it('replaces a single variable', () => {
    expect(render('Hello {{name}}', { name: 'World' })).toBe('Hello World')
  })

  it('replaces multiple variables', () => {
    const result = render('{{a}} and {{b}}', { a: 'foo', b: 'bar' })
    expect(result).toBe('foo and bar')
  })

  it('replaces the same variable multiple times', () => {
    const result = render('{{name}} is {{name}}', { name: 'Claude' })
    expect(result).toBe('Claude is Claude')
  })

  it('returns unchanged string when no placeholders', () => {
    expect(render('No placeholders here', {})).toBe('No placeholders here')
  })

  it('throws UndefinedVariableError for missing variable', () => {
    expect(() => render('Hello {{missing}}', {})).toThrow(UndefinedVariableError)
  })

  it('throws UndefinedVariableError with variable name in message', () => {
    try {
      render('{{projectName}} is here {{unknown}}', { projectName: 'test' })
    } catch (e) {
      expect(e).toBeInstanceOf(UndefinedVariableError)
      expect((e as Error).message).toContain('unknown')
    }
  })
})
