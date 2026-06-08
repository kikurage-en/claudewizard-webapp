import { describe, it, expect } from 'vitest'
import { render } from '../../generator/render'
import { template as jaClaudeMd } from '../ja/claude_md'
import { template as jaReadmeMd } from '../ja/readme_md'
import { template as jaSkillMd } from '../ja/skill_md'
import { template as jaSecurityMd } from '../ja/security_guidelines_md'
import { template as enClaudeMd } from '../en/claude_md'
import { template as enReadmeMd } from '../en/readme_md'
import { template as enSkillMd } from '../en/skill_md'
import { template as enSecurityMd } from '../en/security_guidelines_md'

// Free 再設計: テンプレは projectName + domain のみ使用（静的・完成・dotfiles/CLI 接地）
const vars = { projectName: 'test-project', domain: 'ソフトウェア開発' }
const enVars = { projectName: 'test-project', domain: 'Software Development' }

// TODO/プレースホルダ文言（"粗い"の症状）。再設計で完全撤廃されていること。
const TODO_PATTERNS = [/ここに記載する/, /Describe .* here/, /<repository-url>/]

describe('Japanese Free templates（dotfiles/CLI 接地）', () => {
  it('claude_md: projectName/domain 反映・TODO なし・≤100行・構造あり・MUST・@参照', () => {
    const r = render(jaClaudeMd, vars)
    expect(r).toContain('test-project')
    expect(r).toContain('ソフトウェア開発')
    for (const p of TODO_PATTERNS) expect(r).not.toMatch(p)
    expect(r.split('\n').length).toBeLessThanOrEqual(100) // CLI project-concept #5（≤100行）
    expect((r.match(/^## /gm) ?? []).length).toBeGreaterThanOrEqual(6) // セクション構造
    expect(r).toContain('MUST') // dotfiles 12-rule 由来
    expect(r).toContain('@.claude/rules/security-guidelines.md') // @参照
  })

  it('readme_md: projectName 反映・TODO/プレースホルダなし', () => {
    const r = render(jaReadmeMd, vars)
    expect(r).toContain('test-project')
    for (const p of TODO_PATTERNS) expect(r).not.toMatch(p)
  })

  it('skill_md: YAML frontmatter + projectName + /verify', () => {
    const r = render(jaSkillMd, vars)
    expect(r.startsWith('---')).toBe(true)
    expect(r).toContain('test-project')
    expect(r).toContain('/verify')
    for (const p of TODO_PATTERNS) expect(r).not.toMatch(p)
  })

  it('security_guidelines_md renders（Free/Light 共有・Slice1 では非改変）', () => {
    const r = render(jaSecurityMd, vars)
    expect(r).toContain('test-project')
    expect(r).toContain('セキュリティガイドライン')
  })
})

describe('English Free templates（dotfiles/CLI 接地）', () => {
  it('claude_md: grounded・no TODO・≤100行・structure・MUST', () => {
    const r = render(enClaudeMd, enVars)
    expect(r).toContain('test-project')
    expect(r).toContain('Software Development')
    for (const p of TODO_PATTERNS) expect(r).not.toMatch(p)
    expect(r.split('\n').length).toBeLessThanOrEqual(100)
    expect((r.match(/^## /gm) ?? []).length).toBeGreaterThanOrEqual(6)
    expect(r).toContain('MUST')
  })

  it('readme_md: no TODO/placeholder', () => {
    const r = render(enReadmeMd, enVars)
    expect(r).toContain('test-project')
    for (const p of TODO_PATTERNS) expect(r).not.toMatch(p)
  })

  it('skill_md: frontmatter + /verify', () => {
    const r = render(enSkillMd, enVars)
    expect(r.startsWith('---')).toBe(true)
    expect(r).toContain('test-project')
    expect(r).toContain('/verify')
    for (const p of TODO_PATTERNS) expect(r).not.toMatch(p)
  })

  it('security_guidelines_md renders', () => {
    const r = render(enSecurityMd, enVars)
    expect(r).toContain('test-project')
    expect(r).toContain('Security Guidelines')
  })
})

describe('Free テンプレは projectName + domain のみに依存（静的の限界に逆算）', () => {
  // q3/q4/q5 由来の変数を渡さなくても render が成功する＝それらに依存しないことの証明
  it('ja: renders with only projectName + domain', () => {
    for (const tmpl of [jaClaudeMd, jaReadmeMd, jaSkillMd, jaSecurityMd]) {
      expect(() => render(tmpl, vars)).not.toThrow()
    }
  })
  it('en: renders with only projectName + domain', () => {
    for (const tmpl of [enClaudeMd, enReadmeMd, enSkillMd, enSecurityMd]) {
      expect(() => render(tmpl, enVars)).not.toThrow()
    }
  })
})
