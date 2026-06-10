import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { generate, NotImplementedError, MissingApiKeyError } from '../generate'

const mockAnswers = {
  q1: 'software',
  q2: 'awesome-api',
  q3: 'create',
  q4: 'programming',
  q5: 'quality',
  stack: 'ts',
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

  it('ZIP contains 5 files in correct paths', async () => {
    const blob = await generate('free', 'ja', mockAnswers)
    const zip = await JSZip.loadAsync(blob)
    const allEntries = Object.keys(zip.files)
    expect(allEntries).toContain('CLAUDE.md')
    expect(allEntries).toContain('README.md')
    expect(allEntries).toContain('.claude/skills/main/SKILL.md')
    expect(allEntries).toContain('.claude/rules/security-guidelines.md')
    expect(allEntries).toContain('.claude/rules/core-principles.md')
    const fileEntries = Object.values(zip.files).filter((f) => !f.dir)
    expect(fileEntries.length).toBe(5)
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

  // --- Free 再設計（2問・静的完成テンプレ）の deterministic 検証 ---

  it('Free: 旧5問state（余分な q3-q5/q6 を含む）でも 5 ファイル・projectName 反映・TODO なし', async () => {
    // 再設計前の 5-6 問フローの回答が残っていても新フロー（q1/q2 のみ使用）で正しく動く（migration/F3）
    const legacyAnswers = {
      q1: 'software', q2: 'awesome-api', q3: 'create', q4: 'programming', q5: 'quality', q6: 'note',
    }
    const blob = await generate('free', 'ja', legacyAnswers)
    const zip = await JSZip.loadAsync(blob)
    expect(Object.values(zip.files).filter((f) => !f.dir).length).toBe(5)
    const claudeMd = (await zip.file('CLAUDE.md')?.async('string')) ?? ''
    expect(claudeMd).toContain('awesome-api')
    // 記入指示・命令形が出力に残っていない（実文言ベース・false PASS 撲滅）
    expect(claudeMd).not.toMatch(/書く。|に置き換える|合わせて調整する/)
    // q3/q4/q5 既定値ラベルが出力に現れない（静的テンプレが装飾依存していないことの証明）
    expect(claudeMd).not.toContain('幅広い作業') // workType ラベル
    expect(claudeMd).not.toContain('アウトプット品質の向上') // goal ラベル
  })

  it('Free: q1/q2 のみでも 5 ファイル生成', async () => {
    const minimal = { q1: 'software', q2: 'minimal-proj' }
    const blob = await generate('free', 'ja', minimal)
    const zip = await JSZip.loadAsync(blob)
    expect(Object.values(zip.files).filter((f) => !f.dir).length).toBe(5)
    const claudeMd = (await zip.file('CLAUDE.md')?.async('string')) ?? ''
    expect(claudeMd).toContain('minimal-proj')
  })

  it('Free: stack=ts で Tech Stack が実値化（TypeScript 出現・go 非出現・コマンド非断定）', async () => {
    const blob = await generate('free', 'ja', { q1: 'software', q2: 'ts-proj', stack: 'ts' })
    const zip = await JSZip.loadAsync(blob)
    const claudeMd = (await zip.file('CLAUDE.md')?.async('string')) ?? ''
    expect(claudeMd).toContain('TypeScript')
    expect(claudeMd).not.toContain('言語: Go')
    // パッケージマネージャが分岐する ts は推測コマンドを断定しない（pivot の核心）
    expect(claudeMd).not.toMatch(/npm (install|test|run)/)
  })

  it('Free: stack 未指定でも記入指示が出ない（other-code フォールバック）', async () => {
    const blob = await generate('free', 'ja', { q1: 'software', q2: 'no-stack' })
    const zip = await JSZip.loadAsync(blob)
    const claudeMd = (await zip.file('CLAUDE.md')?.async('string')) ?? ''
    expect(claudeMd).not.toMatch(/書く。|に置き換える|合わせて調整する/)
    expect(claudeMd).toContain('複数またはその他')
  })
})
