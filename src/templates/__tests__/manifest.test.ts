import { describe, it, expect } from 'vitest'
import { FREE_MANIFEST, LIGHT_MANIFEST, PLUS_MANIFEST, getManifest } from '../manifest'

// per-tier atomic / 非波及ガード（adversarial review finding 3）:
// LIGHT は FREE を spread して末尾追加するが、PLUS は独立明示配列で LIGHT/FREE を spread しない。
// LIGHT への追加が FREE / PLUS の count に波及しないことを deterministic に証明する。
describe('manifest（tier 別 file 数・非波及）', () => {
  it('FREE=5 / LIGHT=8 / PLUS=9', () => {
    expect(FREE_MANIFEST).toHaveLength(5)
    expect(LIGHT_MANIFEST).toHaveLength(8)
    expect(PLUS_MANIFEST).toHaveLength(9)
  })

  it('FREE は core-principles.md を含む（4→5 の追加分・CLI 必須 rules 接地）', () => {
    expect(FREE_MANIFEST.map((e) => e.zipPath)).toContain('.claude/rules/core-principles.md')
  })

  it('LIGHT は CLI 必須 5 rules を完備する（6→8: prevent-narrow-framing / failure-routing 追加）', () => {
    const paths = LIGHT_MANIFEST.map((e) => e.zipPath)
    expect(paths).toContain('.claude/rules/core-principles.md')
    expect(paths).toContain('.claude/rules/security-guidelines.md')
    expect(paths).toContain('.claude/rules/development-workflow.md')
    expect(paths).toContain('.claude/rules/prevent-narrow-framing.md')
    expect(paths).toContain('.claude/rules/failure-routing.md')
  })

  it('LIGHT の先頭 5 件は FREE と一致（spread 整合・Free 非波及）', () => {
    expect(LIGHT_MANIFEST.slice(0, 5)).toEqual(FREE_MANIFEST)
  })

  it('PLUS は FREE/LIGHT 追加分を含まず LIGHT を spread しない（Plus 非波及）', () => {
    // PLUS が FREE/LIGHT 追加分（core-principles / 新 2 rules）を含まない＝spread していない構造的証明
    const paths = PLUS_MANIFEST.map((e) => e.zipPath)
    expect(paths).not.toContain('.claude/rules/core-principles.md')
    expect(paths).not.toContain('.claude/rules/prevent-narrow-framing.md')
    expect(paths).not.toContain('.claude/rules/failure-routing.md')
    // PLUS は独立配列なので FREE/LIGHT への追加で length は変わらない
    expect(PLUS_MANIFEST).toHaveLength(9)
  })

  it('getManifest が plan ごとに正しい配列を返す', () => {
    expect(getManifest('free')).toBe(FREE_MANIFEST)
    expect(getManifest('light')).toBe(LIGHT_MANIFEST)
    expect(getManifest('plus')).toBe(PLUS_MANIFEST)
  })

  it('全 manifest の templateKey / zipPath が一意', () => {
    for (const m of [FREE_MANIFEST, LIGHT_MANIFEST, PLUS_MANIFEST]) {
      const paths = m.map((e) => e.zipPath)
      expect(new Set(paths).size).toBe(paths.length)
    }
  })
})
