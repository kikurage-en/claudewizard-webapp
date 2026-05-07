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

const vars = {
  projectName: 'test-project',
  domain: 'ソフトウェア開発',
  workType: '新しいものを作る',
  tool: 'プログラミング言語',
  goal: '作業スピードの向上',
}

const enVars = {
  projectName: 'test-project',
  domain: 'Software Development',
  workType: 'Creating new things',
  tool: 'Programming languages',
  goal: 'Increasing work speed',
}

describe('Japanese templates', () => {
  it('claude_md renders without errors', () => {
    const result = render(jaClaudeMd, vars)
    expect(result).toContain('test-project')
    expect(result).toContain('ソフトウェア開発')
    expect(result).toContain('新しいものを作る')
  })

  it('readme_md renders without errors', () => {
    const result = render(jaReadmeMd, vars)
    expect(result).toContain('test-project')
    expect(result).toContain('プログラミング言語')
  })

  it('skill_md renders without errors', () => {
    const result = render(jaSkillMd, vars)
    expect(result).toContain('test-project')
    expect(result).toContain('/verify')
  })

  it('security_guidelines_md renders without errors', () => {
    const result = render(jaSecurityMd, vars)
    expect(result).toContain('test-project')
    expect(result).toContain('セキュリティガイドライン')
  })
})

describe('English templates', () => {
  it('claude_md renders without errors', () => {
    const result = render(enClaudeMd, enVars)
    expect(result).toContain('test-project')
    expect(result).toContain('Software Development')
    expect(result).toContain('Creating new things')
  })

  it('readme_md renders without errors', () => {
    const result = render(enReadmeMd, enVars)
    expect(result).toContain('test-project')
    expect(result).toContain('Programming languages')
  })

  it('skill_md renders without errors', () => {
    const result = render(enSkillMd, enVars)
    expect(result).toContain('test-project')
    expect(result).toContain('/verify')
  })

  it('security_guidelines_md renders without errors', () => {
    const result = render(enSecurityMd, enVars)
    expect(result).toContain('test-project')
    expect(result).toContain('Security Guidelines')
  })
})

describe('template variable completeness', () => {
  it('all ja templates have matching placeholder variables', () => {
    const allTemplates = [jaClaudeMd, jaReadmeMd, jaSkillMd, jaSecurityMd]
    for (const tmpl of allTemplates) {
      expect(() => render(tmpl, vars)).not.toThrow()
    }
  })

  it('all en templates have matching placeholder variables', () => {
    const allTemplates = [enClaudeMd, enReadmeMd, enSkillMd, enSecurityMd]
    for (const tmpl of allTemplates) {
      expect(() => render(tmpl, enVars)).not.toThrow()
    }
  })
})
