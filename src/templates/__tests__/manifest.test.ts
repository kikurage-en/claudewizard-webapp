import { describe, it, expect } from 'vitest'
import { FREE_MANIFEST, LIGHT_MANIFEST, PLUS_MANIFEST, getManifest } from '../manifest'

// per-tier atomic / 非波及ガード（adversarial review finding 3）:
// LIGHT は FREE を spread して末尾追加するが、PLUS は独立明示配列で LIGHT/FREE を spread しない。
// LIGHT への追加が FREE / PLUS の count に波及しないことを deterministic に証明する。
describe('manifest（tier 別 file 数・非波及）', () => {
  it('FREE=4 / LIGHT=6 / PLUS=9', () => {
    expect(FREE_MANIFEST).toHaveLength(4)
    expect(LIGHT_MANIFEST).toHaveLength(6)
    expect(PLUS_MANIFEST).toHaveLength(9)
  })

  it('LIGHT は core-principles.md を含む（5→6 の追加分）', () => {
    expect(LIGHT_MANIFEST.map((e) => e.zipPath)).toContain('.claude/rules/core-principles.md')
  })

  it('LIGHT の先頭 4 件は FREE と一致（spread 整合・Free 非波及）', () => {
    expect(LIGHT_MANIFEST.slice(0, 4)).toEqual(FREE_MANIFEST)
  })

  it('PLUS は core-principles.md / development-workflow を独立定義し LIGHT を spread しない（Plus 非波及）', () => {
    // PLUS が LIGHT 末尾追加分（core-principles）を含まない＝LIGHT を spread していない構造的証明
    expect(PLUS_MANIFEST.map((e) => e.zipPath)).not.toContain('.claude/rules/core-principles.md')
    // PLUS は独立配列なので LIGHT への追加で length は変わらない
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
