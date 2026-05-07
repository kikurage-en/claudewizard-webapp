import type { Plan } from '../wizard/types'
import { parseAnswers } from './parseAnswers'
import { render } from './render'
import { buildZip } from './zipBuilder'
import { getManifest } from '../templates/manifest'
import { generateLight } from './lightGenerator'
import { getApiKey } from '../security/sessionStore'

type Templates = Record<string, string>

async function loadTemplates(lang: 'ja' | 'en'): Promise<Templates> {
  if (lang === 'ja') {
    const [claudeMd, readmeMd, skillMd, securityMd] = await Promise.all([
      import('../templates/ja/claude_md'),
      import('../templates/ja/readme_md'),
      import('../templates/ja/skill_md'),
      import('../templates/ja/security_guidelines_md'),
    ])
    return {
      claude_md: claudeMd.template,
      readme_md: readmeMd.template,
      skill_md: skillMd.template,
      security_guidelines_md: securityMd.template,
    }
  } else {
    const [claudeMd, readmeMd, skillMd, securityMd] = await Promise.all([
      import('../templates/en/claude_md'),
      import('../templates/en/readme_md'),
      import('../templates/en/skill_md'),
      import('../templates/en/security_guidelines_md'),
    ])
    return {
      claude_md: claudeMd.template,
      readme_md: readmeMd.template,
      skill_md: skillMd.template,
      security_guidelines_md: securityMd.template,
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

  const vars = parseAnswers(answers, lang)
  const templates = await loadTemplates(lang)
  const manifest = getManifest(plan)

  const files = manifest.map((entry) => {
    const tmpl = templates[entry.templateKey]
    if (!tmpl) throw new Error(`Template not found: ${entry.templateKey}`)
    return { path: entry.zipPath, content: render(tmpl, vars) }
  })

  return buildZip(files)
}
