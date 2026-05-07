import { describe, it, expect } from 'vitest'
import { parseAnswers } from '../parseAnswers'

const mockAnswers = {
  q1: 'software',
  q2: 'my-project',
  q3: 'create',
  q4: 'programming',
  q5: 'speed',
}

describe('parseAnswers', () => {
  it('returns correct vars for Japanese', () => {
    const vars = parseAnswers(mockAnswers, 'ja')
    expect(vars.projectName).toBe('my-project')
    expect(vars.domain).toBe('ソフトウェア開発')
    expect(vars.workType).toBe('新しいものを作る')
    expect(vars.tool).toBe('プログラミング言語')
    expect(vars.goal).toBe('作業スピードの向上')
  })

  it('returns correct vars for English', () => {
    const vars = parseAnswers(mockAnswers, 'en')
    expect(vars.projectName).toBe('my-project')
    expect(vars.domain).toBe('Software Development')
    expect(vars.workType).toBe('Creating new things')
    expect(vars.tool).toBe('Programming languages')
    expect(vars.goal).toBe('Increasing work speed')
  })

  it('trims whitespace from project name', () => {
    const vars = parseAnswers({ ...mockAnswers, q2: '  my-app  ' }, 'ja')
    expect(vars.projectName).toBe('my-app')
  })

  it('falls back to key when domain not found', () => {
    const vars = parseAnswers({ ...mockAnswers, q1: 'unknown-domain' }, 'ja')
    expect(vars.domain).toBe('unknown-domain')
  })

  it('uses defaults when answers are missing', () => {
    const vars = parseAnswers({}, 'ja')
    expect(vars.projectName).toBe('my-project')
    expect(vars.domain).toBe('その他')
  })
})
