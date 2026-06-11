import { describe, it, expect } from 'vitest'
import { buildStackVars } from '../stackProfiles'

const STACK_VALUES = ['ts', 'python', 'go', 'rust', 'other-code', 'non-code'] as const

// 記入指示・命令形パターン（実テンプレ由来）。完成文に残ってはならない（false PASS 撲滅）。
const INSTRUCTION_PATTERNS_JA = [/に置き換える/, /合わせて調整する/, /書く。/]
const INSTRUCTION_PATTERNS_EN = [/adjust to your actual/i, /replace with your real/i, /document only/i, /describe the/i]

// 各選択肢に必ず現れる固有の具体文字列（BLOCK 指摘3: 「非空」だけにしない）
const SIGNATURE: Record<string, { ja: RegExp; en: RegExp }> = {
  ts: { ja: /TypeScript/, en: /TypeScript/ },
  python: { ja: /Python/, en: /Python/ },
  go: { ja: /言語: Go/, en: /Language: Go/ },
  rust: { ja: /Rust/, en: /Rust/ },
  'other-code': { ja: /複数|その他/, en: /Multiple|other/i },
  'non-code': { ja: /コード以外/, en: /non-code/i },
}

// 2026-06-11「全行が効く」化: Build & Test / Architecture はコード由来の事実であり
// 生成時に捏造しない（/init へ委譲）。stackProfiles は techStack（回答の実反映）のみを返す。
describe('buildStackVars（Free Tech Stack マッピング・回答実反映のみ）', () => {
  for (const lang of ['ja', 'en'] as const) {
    describe(`lang=${lang}`, () => {
      for (const v of STACK_VALUES) {
        it(`${v}: techStack が非空・固有の具体文字列あり・記入指示命令形なし`, () => {
          const r = buildStackVars(v, lang)
          expect(r.techStack.length).toBeGreaterThan(0)
          // 選択肢固有の具体文字列（汎用プレースホルダーで濁していないことの証明）
          expect(r.techStack).toMatch(SIGNATURE[v][lang])
          // 記入指示・命令形が残っていない
          const patterns = lang === 'ja' ? INSTRUCTION_PATTERNS_JA : INSTRUCTION_PATTERNS_EN
          for (const p of patterns) expect(r.techStack).not.toMatch(p)
        })
      }
    })
  }

  it('未知の値・未回答は other-code にフォールバック（破綻しない完成文）', () => {
    const r = buildStackVars('unknown-xyz', 'ja')
    expect(r.techStack).toContain('複数またはその他')
  })

  it('コード由来事実（buildCommands/architecture）を返さない（/init 委譲の構造的証明）', () => {
    const keys = Object.keys(buildStackVars('ts', 'ja'))
    expect(keys).toEqual(['techStack'])
  })

  it('ts: コマンド・パッケージマネージャを断定しない（推測注入の回避）', () => {
    const r = buildStackVars('ts', 'ja')
    expect(r.techStack).not.toMatch(/npm (install|test|run)/)
    expect(r.techStack).not.toMatch(/pnpm|yarn/)
  })
})
