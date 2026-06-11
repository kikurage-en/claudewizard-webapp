import { describe, it, expect } from 'vitest'
import { render } from '../../generator/render'
import { parseAnswers } from '../../generator/parseAnswers'
import { buildStackVars } from '../../generator/stackProfiles'
import { buildDomainVars, isCodeFree, isCodeLight } from '../../generator/domainProfiles'
import { FREE_MANIFEST, LIGHT_MANIFEST } from '../manifest'
import { template as jaClaudeMd } from '../ja/claude_md'
import { template as jaReadmeMd } from '../ja/readme_md'
import { template as jaSkillMd } from '../ja/skill_md'
import { template as jaSecurityMd } from '../ja/security_guidelines_md'
import { template as jaCorePrinciplesMd } from '../ja/core_principles_md'
import { template as jaWorkflowMd } from '../ja/development_workflow_md'
import { template as jaNarrowFramingMd } from '../ja/prevent_narrow_framing_md'
import { template as jaFailureRoutingMd } from '../ja/failure_routing_md'
import { template as enClaudeMd } from '../en/claude_md'
import { template as enReadmeMd } from '../en/readme_md'
import { template as enSkillMd } from '../en/skill_md'
import { template as enSecurityMd } from '../en/security_guidelines_md'
import { template as enCorePrinciplesMd } from '../en/core_principles_md'
import { template as enWorkflowMd } from '../en/development_workflow_md'
import { template as enNarrowFramingMd } from '../en/prevent_narrow_framing_md'
import { template as enFailureRoutingMd } from '../en/failure_routing_md'

// 生成物の「ベストプラクティス」接地を deterministic に証明するテスト。
// 本来目的: domain×stack の全組合せで (1) 完成形（未解決変数・TODO なし）、(2) ≤100 行規約、
// (3) @参照整合（参照先が同梱される）、(4) code/non-code の文言適合（非コード分野に
// コード専用指示が混入しない・コード分野には現行文言が保たれる）を証明する。

const DOMAINS = ['software', 'data-research', 'writing', 'sns', 'automation', 'design', 'other'] as const
const STACKS = ['ts', 'python', 'go', 'rust', 'other-code', 'non-code'] as const
const TOOLS = ['programming', 'office', 'creative', 'sns', 'cli', 'other'] as const

// テスト側で独立に定義する期待値（実装の isCode* と突き合わせる二重化）
const CODE_DOMAINS = ['software', 'data-research', 'automation']
const CODE_TOOLS = ['programming', 'cli']

const JA_FREE: Record<string, string> = {
  claude_md: jaClaudeMd,
  readme_md: jaReadmeMd,
  skill_md: jaSkillMd,
  security_guidelines_md: jaSecurityMd,
  core_principles_md: jaCorePrinciplesMd,
}
const EN_FREE: Record<string, string> = {
  claude_md: enClaudeMd,
  readme_md: enReadmeMd,
  skill_md: enSkillMd,
  security_guidelines_md: enSecurityMd,
  core_principles_md: enCorePrinciplesMd,
}
const JA_LIGHT_STATIC: Record<string, string> = {
  security_guidelines_md: jaSecurityMd,
  development_workflow_md: jaWorkflowMd,
  core_principles_md: jaCorePrinciplesMd,
  prevent_narrow_framing_md: jaNarrowFramingMd,
  failure_routing_md: jaFailureRoutingMd,
}
const EN_LIGHT_STATIC: Record<string, string> = {
  security_guidelines_md: enSecurityMd,
  development_workflow_md: enWorkflowMd,
  core_principles_md: enCorePrinciplesMd,
  prevent_narrow_framing_md: enNarrowFramingMd,
  failure_routing_md: enFailureRoutingMd,
}

// code 専用マーカー（実テンプレ文言ベース。positive/negative 両方向で検証する）
const CODE_MARKERS = {
  ja: {
    claudeWorkRule: 'コードを書く前に',
    securityDependency: 'npm audit',
    securityInjection: 'SQL',
    skillReview: '変更差分',
  },
  en: {
    claudeWorkRule: 'callers, and shared utilities',
    securityDependency: 'npm audit',
    securityInjection: 'SQL injection',
    skillReview: 'Review the diff',
  },
}

// 埋め草マーカー（公式 remove テスト不合格の汎用前提文）。全組合せで不在を証明する。
// 旧テンプレの Architecture 節「一般的な構成（src/ 等）を前提に Claude が動作する」由来。
const FILLER_MARKERS = {
  ja: ['一般的な構成', 'を前提に Claude'],
  en: ['assumes a conventional', 'Claude assumes'],
}

function renderFree(domain: string, stack: string, lang: 'ja' | 'en'): Record<string, string> {
  const answers = { q1: domain, q2: 'qa-proj', stack }
  const vars = {
    ...parseAnswers(answers, lang),
    ...buildStackVars(stack, lang),
    ...buildDomainVars(isCodeFree(answers['stack']), lang),
  }
  const templates = lang === 'ja' ? JA_FREE : EN_FREE
  const out: Record<string, string> = {}
  for (const entry of FREE_MANIFEST) {
    const tmpl = templates[entry.templateKey]
    expect(tmpl, `FREE template missing: ${entry.templateKey}`).toBeDefined()
    out[entry.zipPath] = render(tmpl, vars)
  }
  return out
}

function renderLightStatic(q1: string, q4: string, lang: 'ja' | 'en'): Record<string, string> {
  const answers = { q1, q2: 'qa-proj', q3: 'create', q4, q5: 'quality' }
  const vars = {
    ...parseAnswers(answers, lang),
    ...buildDomainVars(isCodeLight(answers), lang),
  }
  const templates = lang === 'ja' ? JA_LIGHT_STATIC : EN_LIGHT_STATIC
  const out: Record<string, string> = {}
  for (const entry of LIGHT_MANIFEST) {
    const tmpl = templates[entry.templateKey]
    if (!tmpl) continue // claude_md/readme_md/skill_md は API 生成（静的テンプレ対象外）
    out[entry.zipPath] = render(tmpl, vars)
  }
  return out
}

function assertCompletedForm(files: Record<string, string>, label: string) {
  for (const [path, content] of Object.entries(files)) {
    expect(content, `${label} ${path}: 未解決プレースホルダ`).not.toMatch(/\{\{\w+\}\}/)
    expect(content, `${label} ${path}: TODO 残存`).not.toContain('TODO')
  }
}

function assertRefIntegrity(files: Record<string, string>, manifestPaths: string[], label: string) {
  for (const [path, content] of Object.entries(files)) {
    const refs = content.match(/\.claude\/[A-Za-z0-9_\-./]*\.(?:md|json)/g) ?? []
    for (const ref of refs) {
      expect(manifestPaths, `${label} ${path}: 参照先 ${ref} が同梱されない`).toContain(ref)
    }
  }
}

describe.each(['ja', 'en'] as const)('Free 生成物の品質（%s・7 domain × 6 stack 全組合せ）', (lang) => {
  const m = CODE_MARKERS[lang]
  const manifestPaths = FREE_MANIFEST.map((e) => e.zipPath)

  for (const domain of DOMAINS) {
    for (const stack of STACKS) {
      const expectCode = stack !== 'non-code'
      it(`${domain} × ${stack}: 完成形・≤100行・@参照整合・${expectCode ? 'code' : 'non-code'} 文言適合`, () => {
        const files = renderFree(domain, stack, lang)
        const label = `[${lang} ${domain}×${stack}]`

        assertCompletedForm(files, label)
        assertRefIntegrity(files, manifestPaths, label)

        const claudeMd = files['CLAUDE.md']
        expect(claudeMd.split('\n').length, `${label} CLAUDE.md 行数`).toBeLessThanOrEqual(100)

        const securityMd = files['.claude/rules/security-guidelines.md']
        const skillMd = files['.claude/skills/main/SKILL.md']
        const readmeMd = files['README.md']

        // 埋め草の不在（全組合せ）: 公式 remove テスト不合格の汎用前提文が復活していない
        for (const filler of FILLER_MARKERS[lang]) {
          expect(claudeMd, `${label} 埋め草混入: ${filler}`).not.toContain(filler)
        }

        if (expectCode) {
          // code 系: 現行のコード向け文言が保たれている（positive）
          expect(claudeMd).toContain(m.claudeWorkRule)
          expect(securityMd).toContain(m.securityDependency)
          expect(skillMd).toContain(m.skillReview)
          // /init 育成フローの案内: CLAUDE.md は HTML コメント（context 非消費）、README は節
          expect(claudeMd).toContain('<!--')
          expect(claudeMd).toContain('/init')
          expect(readmeMd).toContain('/init')
        } else {
          // non-code 系: コード専用指示が混入しない（negative）
          expect(claudeMd).not.toContain(m.claudeWorkRule)
          expect(securityMd).not.toContain(m.securityDependency)
          expect(securityMd).not.toContain(m.securityInjection)
          expect(skillMd).not.toContain(m.skillReview)
          // /init はコード分析ツールのため非コード分野には案内しない
          expect(claudeMd).not.toContain('/init')
          expect(readmeMd).not.toContain('/init')
        }
      })
    }
  }
})

describe.each(['ja', 'en'] as const)('Light 静的テンプレの品質（%s・7 domain × 6 tool 全組合せ）', (lang) => {
  const m = CODE_MARKERS[lang]
  const manifestPaths = LIGHT_MANIFEST.map((e) => e.zipPath)

  for (const q1 of DOMAINS) {
    for (const q4 of TOOLS) {
      const expectCode = CODE_DOMAINS.includes(q1) || CODE_TOOLS.includes(q4)
      it(`${q1} × ${q4}: 完成形・@参照整合・${expectCode ? 'code' : 'non-code'} 文言適合`, () => {
        const files = renderLightStatic(q1, q4, lang)
        const label = `[${lang} ${q1}×${q4}]`

        assertCompletedForm(files, label)
        assertRefIntegrity(files, manifestPaths, label)

        const securityMd = files['.claude/rules/security-guidelines.md']
        if (expectCode) {
          expect(securityMd).toContain(m.securityDependency)
        } else {
          expect(securityMd).not.toContain(m.securityDependency)
          expect(securityMd).not.toContain(m.securityInjection)
        }
      })
    }
  }
})

describe('新規 rules テンプレ（dotfiles 接地・3 節形式）', () => {
  const vars = { projectName: 'qa-proj' }
  it('ja: prevent-narrow-framing が 発火条件/達成条件/自己適用 を持つ', () => {
    const r = render(jaNarrowFramingMd, vars)
    expect(r).toContain('qa-proj')
    expect(r).toContain('## 発火条件')
    expect(r).toContain('## 達成条件')
    expect(r).toContain('## 自己適用')
  })
  it('ja: failure-routing が 分類表（失敗タイプ→置き場所）と昇格条件を持つ', () => {
    const r = render(jaFailureRoutingMd, vars)
    expect(r).toContain('qa-proj')
    expect(r).toMatch(/\|.*失敗タイプ.*\|/)
    expect(r).toContain('## 昇格条件')
  })
  it('en: prevent-narrow-framing has Triggers/Requirements/Self-Application', () => {
    const r = render(enNarrowFramingMd, vars)
    expect(r).toContain('qa-proj')
    expect(r).toContain('## Triggers')
    expect(r).toContain('## Requirements')
    expect(r).toContain('## Self-Application')
  })
  it('en: failure-routing has routing table and promotion criteria', () => {
    const r = render(enFailureRoutingMd, vars)
    expect(r).toContain('qa-proj')
    expect(r).toMatch(/\|.*Failure type.*\|/i)
    expect(r).toContain('## Promotion Criteria')
  })
  it('新規テンプレは ≤60 行・記入指示なし（ja/en）', () => {
    for (const tmpl of [jaNarrowFramingMd, jaFailureRoutingMd, enNarrowFramingMd, enFailureRoutingMd]) {
      const r = render(tmpl, vars)
      expect(r.split('\n').length).toBeLessThanOrEqual(60)
      expect(r).not.toMatch(/に置き換える|合わせて調整する|書く。/)
      expect(r).not.toMatch(/adjust to your actual|replace with your real/i)
    }
  })
})

describe('isCode 判定（Free=stack 軸優先 / Light=domain∪tool 信号）', () => {
  it('Free: stack=non-code のみ non-code、未回答は code（other-code フォールバック）', () => {
    expect(isCodeFree('non-code')).toBe(false)
    for (const stack of ['ts', 'python', 'go', 'rust', 'other-code']) {
      expect(isCodeFree(stack)).toBe(true)
    }
    expect(isCodeFree(undefined)).toBe(true)
  })
  it('Light: code domain または code tool のどちらかで code', () => {
    expect(isCodeLight({ q1: 'software', q4: 'office' })).toBe(true) // domain 信号
    expect(isCodeLight({ q1: 'writing', q4: 'programming' })).toBe(true) // tool 信号
    expect(isCodeLight({ q1: 'writing', q4: 'office' })).toBe(false)
    expect(isCodeLight({ q1: 'sns', q4: 'sns' })).toBe(false)
    expect(isCodeLight({})).toBe(false) // 信号なしは non-code（安全側）
  })
})
