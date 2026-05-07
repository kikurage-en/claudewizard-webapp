import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { generate, NotImplementedError, MissingApiKeyError } from '../generate'

const mockAnswers = {
  q1: 'software',
  q2: 'awesome-api',
  q3: 'create',
  q4: 'programming',
  q5: 'quality',
}

describe('generate', () => {
  it('throws MissingApiKeyError for light plan without API key', async () => {
    await expect(generate('light', 'ja', mockAnswers)).rejects.toThrow(MissingApiKeyError)
  })

  it('throws NotImplementedError for plus plan', async () => {
    await expect(generate('plus', 'ja', mockAnswers)).rejects.toThrow(NotImplementedError)
  })

  it('generates a Blob for free plan in Japanese', async () => {
    const blob = await generate('free', 'ja', mockAnswers)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('generates a Blob for free plan in English', async () => {
    const blob = await generate('free', 'en', mockAnswers)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('ZIP contains 4 files in correct paths', async () => {
    const blob = await generate('free', 'ja', mockAnswers)
    const zip = await JSZip.loadAsync(blob)
    const allEntries = Object.keys(zip.files)
    expect(allEntries).toContain('CLAUDE.md')
    expect(allEntries).toContain('README.md')
    expect(allEntries).toContain('.claude/skills/main/SKILL.md')
    expect(allEntries).toContain('.claude/rules/security-guidelines.md')
    const fileEntries = Object.values(zip.files).filter((f) => !f.dir)
    expect(fileEntries.length).toBe(4)
  })

  it('ZIP files contain project name in content', async () => {
    const blob = await generate('free', 'ja', mockAnswers)
    const zip = await JSZip.loadAsync(blob)
    const claudeMd = await zip.file('CLAUDE.md')?.async('string')
    expect(claudeMd).toContain('awesome-api')
  })

  it('ZIP CLAUDE.md in English contains project name', async () => {
    const blob = await generate('free', 'en', mockAnswers)
    const zip = await JSZip.loadAsync(blob)
    const claudeMd = await zip.file('CLAUDE.md')?.async('string')
    expect(claudeMd).toContain('awesome-api')
    expect(claudeMd).toContain('Software Development')
  })
})
