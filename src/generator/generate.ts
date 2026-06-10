import type { Plan } from '../wizard/types'
import { parseAnswers } from './parseAnswers'
import { buildStackVars } from './stackProfiles'
import { buildDomainVars, isCodeFree } from './domainProfiles'
import { render } from './render'
import { buildZip } from './zipBuilder'
import { getManifest } from '../templates/manifest'
import { generateLight } from './lightGenerator'
import { getApiKey } from '../security/sessionStore'

type Templates = Record<string, string>

async function loadTemplates(lang: 'ja' | 'en'): Promise<Templates> {
  if (lang === 'ja') {
    const [claudeMd, readmeMd, skillMd, securityMd, corePrinciplesMd] = await Promise.all([
      import('../templates/ja/claude_md'),
      import('../templates/ja/readme_md'),
      import('../templates/ja/skill_md'),
      import('../templates/ja/security_guidelines_md'),
      import('../templates/ja/core_principles_md'),
    ])
    return {
      claude_md: claudeMd.template,
      readme_md: readmeMd.template,
      skill_md: skillMd.template,
      security_guidelines_md: securityMd.template,
      core_principles_md: corePrinciplesMd.template,
    }
  } else {
    const [claudeMd, readmeMd, skillMd, securityMd, corePrinciplesMd] = await Promise.all([
      import('../templates/en/claude_md'),
      import('../templates/en/readme_md'),
      import('../templates/en/skill_md'),
      import('../templates/en/security_guidelines_md'),
      import('../templates/en/core_principles_md'),
    ])
    return {
      claude_md: claudeMd.template,
      readme_md: readmeMd.template,
      skill_md: skillMd.template,
      security_guidelines_md: securityMd.template,
      core_principles_md: corePrinciplesMd.template,
    }
  }
}

export class NotImplementedError extends Error {
  constructor(plan: string) {
    super(`Plan "${plan}" is not implemented yet. Coming in a future release.`)
    this.name = 'NotImplementedError'
  }
}

export class MissingApiKeyError extends Error {
  constructor() {
    super('API key is required for this plan. Please enter your Anthropic API key.')
    this.name = 'MissingApiKeyError'
  }
}

export async function generate(
  plan: Plan,
  lang: 'ja' | 'en',
  answers: Record<string, string>
): Promise<Blob> {
  if (plan === 'light') {
    const apiKey = getApiKey()
    if (!apiKey) throw new MissingApiKeyError()
    return generateLight(apiKey, lang, answers)
  }

  if (plan === 'plus') {
    throw new NotImplementedError(plan)
  }

  // Free 経路のみ到達（light は早期 return / plus は throw）。
  // Tech Stack 質問（stack）の回答から Tech Stack / Build & Test / Architecture を実値化する。
  // buildStackVars は Free 専用＝Light/Plus は parseAnswers のみで非到達（per-tier 非波及）。
  // domain 適合（code/non-code 2 分岐）は Free では stack 軸を優先する（domainProfiles.ts）。
  const vars = {
    ...parseAnswers(answers, lang),
    ...buildStackVars(answers['stack'] ?? 'other-code', lang),
    ...buildDomainVars(isCodeFree(answers['stack']), lang),
  }
  const templates = await loadTemplates(lang)
  const manifest = getManifest(plan)

  const files = manifest.map((entry) => {
    const tmpl = templates[entry.templateKey]
    if (!tmpl) throw new Error(`Template not found: ${entry.templateKey}`)
    return { path: entry.zipPath, content: render(tmpl, vars) }
  })

  return buildZip(files)
}
