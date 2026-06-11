import { describe, it, expect } from 'vitest'
import { render } from '../../generator/render'
import { buildStackVars } from '../../generator/stackProfiles'
import { buildDomainVars, isCodeFree } from '../../generator/domainProfiles'
import { template as jaClaudeMd } from '../ja/claude_md'
import { template as jaReadmeMd } from '../ja/readme_md'
import { template as jaSkillMd } from '../ja/skill_md'
import { template as jaSecurityMd } from '../ja/security_guidelines_md'
import { template as enClaudeMd } from '../en/claude_md'
import { template as enReadmeMd } from '../en/readme_md'
import { template as enSkillMd } from '../en/skill_md'
import { template as enSecurityMd } from '../en/security_guidelines_md'
import { template as jaCorePrinciplesMd } from '../ja/core_principles_md'
import { template as enCorePrinciplesMd } from '../en/core_principles_md'

// Free 再設計: テンプレは projectName + domain + stack 由来変数（techStack/buildCommands/architecture）
// + domain 適合変数（code/non-code 2 分岐: domainProfiles.ts）に依存。
const baseJa = { projectName: 'test-project', domain: 'ソフトウェア開発' }
const baseEn = { projectName: 'test-project', domain: 'Software Development' }
const varsJa = { ...baseJa, ...buildStackVars('ts', 'ja'), ...buildDomainVars(true, 'ja') }
const varsEn = { ...baseEn, ...buildStackVars('ts', 'en'), ...buildDomainVars(true, 'en') }

// 記入指示・命令形パターン（実テンプレ由来）。完成テンプレで完全撤廃されていること（false PASS 撲滅）。
// 負検算（設計時確認済み）: 変更前テンプレの全記入指示がこのパターンにマッチする。
//   ja: 「主要ツールを書く。」「実際の構成に合わせて調整する」「具体的なコマンドのみ書く。」
//       「実際のコマンドに置き換える」「役割を 4〜5 行で書く。」
//   en: "List the ..." "adjust to your actual setup" "Document only ..." "replace with your real ..." "Describe the role ..."
// 「コードを書く前に」(Code Style) は /書く。/ に非マッチ＝誤検出しない。
const INSTRUCTION_JA = [/に置き換える/, /合わせて調整する/, /書く。/]
const INSTRUCTION_EN = [/adjust to your actual/i, /replace with your real/i, /Document only/i, /Describe the/i, /List the/i]

describe('Japanese Free templates（dotfiles/CLI 接地・記入指示なし）', () => {
  it('claude_md: projectName/domain/techStack 反映・記入指示なし・≤100行・構造・MUST・@参照', () => {
    const r = render(jaClaudeMd, varsJa)
    expect(r).toContain('test-project')
    expect(r).toContain('ソフトウェア開発')
    expect(r).toContain('TypeScript') // stack 由来の実値
    for (const p of INSTRUCTION_JA) expect(r).not.toMatch(p)
    expect(r.split('\n').length).toBeLessThanOrEqual(100) // CLI project-concept #5（≤100行）
    // 全行が効く方針（2026-06-11）: 埋め草節を持たないため 4 節（Tech Stack/作業ルール/Security/Skills）
    expect((r.match(/^## /gm) ?? []).length).toBeGreaterThanOrEqual(4)
    expect(r).toContain('MUST') // dotfiles 12-rule 由来
    expect(r).toContain('@.claude/rules/security-guidelines.md') // @参照
  })

  it('readme_md: projectName 反映・記入指示なし', () => {
    const r = render(jaReadmeMd, varsJa)
    expect(r).toContain('test-project')
    for (const p of INSTRUCTION_JA) expect(r).not.toMatch(p)
  })

  it('skill_md: YAML frontmatter + projectName + /verify・記入指示なし', () => {
    const r = render(jaSkillMd, varsJa)
    expect(r.startsWith('---')).toBe(true)
    expect(r).toContain('test-project')
    expect(r).toContain('/verify')
    for (const p of INSTRUCTION_JA) expect(r).not.toMatch(p)
  })

  it('security_guidelines_md renders（Free/Light 共有・domain 変数適用）', () => {
    const r = render(jaSecurityMd, varsJa)
    expect(r).toContain('test-project')
    expect(r).toContain('セキュリティガイドライン')
  })
})

describe('English Free templates（dotfiles/CLI 接地・no instructions）', () => {
  it('claude_md: grounded・no instruction・≤100行・structure・MUST・techStack', () => {
    const r = render(enClaudeMd, varsEn)
    expect(r).toContain('test-project')
    expect(r).toContain('Software Development')
    expect(r).toContain('TypeScript')
    for (const p of INSTRUCTION_EN) expect(r).not.toMatch(p)
    expect(r.split('\n').length).toBeLessThanOrEqual(100)
    expect((r.match(/^## /gm) ?? []).length).toBeGreaterThanOrEqual(4)
    expect(r).toContain('MUST')
  })

  it('readme_md: no instruction', () => {
    const r = render(enReadmeMd, varsEn)
    expect(r).toContain('test-project')
    for (const p of INSTRUCTION_EN) expect(r).not.toMatch(p)
  })

  it('skill_md: frontmatter + /verify・no instruction', () => {
    const r = render(enSkillMd, varsEn)
    expect(r.startsWith('---')).toBe(true)
    expect(r).toContain('test-project')
    expect(r).toContain('/verify')
    for (const p of INSTRUCTION_EN) expect(r).not.toMatch(p)
  })

  it('security_guidelines_md renders', () => {
    const r = render(enSecurityMd, varsEn)
    expect(r).toContain('test-project')
    expect(r).toContain('Security Guidelines')
  })
})

describe('core-principles テンプレ（Light 追加・dotfiles/CLI 接地）', () => {
  it('ja: 3原則マーカー含む・projectName 反映・記入指示なし', () => {
    const r = render(jaCorePrinciplesMd, varsJa)
    expect(r).toContain('test-project')
    expect(r).toContain('Evidence First')
    expect(r).toContain('Boundary Check')
    expect(r).toContain('Failure Reflection')
    for (const p of INSTRUCTION_JA) expect(r).not.toMatch(p)
  })
  it('en: 3原則マーカー含む・projectName 反映・記入指示なし', () => {
    const r = render(enCorePrinciplesMd, varsEn)
    expect(r).toContain('test-project')
    expect(r).toContain('Evidence First')
    expect(r).toContain('Boundary Check')
    expect(r).toContain('Failure Reflection')
    for (const p of INSTRUCTION_EN) expect(r).not.toMatch(p)
  })
})

describe('stack 選択ごとに Tech Stack が実値化される（CLAUDE.md・固有文字列）', () => {
  const cases: Array<{ stack: string; ja: RegExp; en: RegExp }> = [
    { stack: 'ts', ja: /TypeScript/, en: /TypeScript/ },
    { stack: 'python', ja: /Python/, en: /Python/ },
    { stack: 'go', ja: /言語: Go/, en: /Language: Go/ },
    { stack: 'rust', ja: /Rust/, en: /Rust/ },
    { stack: 'other-code', ja: /複数|その他/, en: /Multiple|other/i },
    { stack: 'non-code', ja: /コード以外/, en: /non-code/i },
  ]
  for (const c of cases) {
    it(`ja: stack=${c.stack} で固有の実値が出る・記入指示なし`, () => {
      const r = render(jaClaudeMd, {
        ...baseJa,
        ...buildStackVars(c.stack, 'ja'),
        ...buildDomainVars(isCodeFree(c.stack), 'ja'),
      })
      expect(r).toMatch(c.ja)
      for (const p of INSTRUCTION_JA) expect(r).not.toMatch(p)
    })
    it(`en: stack=${c.stack} で固有の実値が出る・記入指示なし`, () => {
      const r = render(enClaudeMd, {
        ...baseEn,
        ...buildStackVars(c.stack, 'en'),
        ...buildDomainVars(isCodeFree(c.stack), 'en'),
      })
      expect(r).toMatch(c.en)
      for (const p of INSTRUCTION_EN) expect(r).not.toMatch(p)
    })
  }
})

describe('Free テンプレは worktype/tool/goal（q3-q5）に依存しない', () => {
  // techStack/buildCommands/architecture を渡せば workType/tool/goal なしで render が成功する
  it('ja: stack 変数のみで全テンプレが render 成功', () => {
    for (const tmpl of [jaClaudeMd, jaReadmeMd, jaSkillMd, jaSecurityMd]) {
      expect(() => render(tmpl, varsJa)).not.toThrow()
    }
  })
  it('en: stack 変数のみで全テンプレが render 成功', () => {
    for (const tmpl of [enClaudeMd, enReadmeMd, enSkillMd, enSecurityMd]) {
      expect(() => render(tmpl, varsEn)).not.toThrow()
    }
  })
})
