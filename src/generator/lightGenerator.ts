import { callClaude } from '../security/anthropicClient'
import { getLightSystemPrompt } from '../security/promptLoader'
import { parseLightOutput } from './parseClaudeOutput'
import { parseAnswers } from './parseAnswers'
import { buildDomainVars, isCodeLight } from './domainProfiles'
import { render } from './render'
import { buildZip } from './zipBuilder'
import { LIGHT_MANIFEST } from '../templates/manifest'

type Lang = 'ja' | 'en'

async function loadStaticTemplates(lang: Lang) {
  if (lang === 'ja') {
    const [securityMd, workflowMd, corePrinciplesMd, narrowFramingMd, failureRoutingMd] = await Promise.all([
      import('../templates/ja/security_guidelines_md'),
      import('../templates/ja/development_workflow_md'),
      import('../templates/ja/core_principles_md'),
      import('../templates/ja/prevent_narrow_framing_md'),
      import('../templates/ja/failure_routing_md'),
    ])
    return {
      security_guidelines_md: securityMd.template,
      development_workflow_md: workflowMd.template,
      core_principles_md: corePrinciplesMd.template,
      prevent_narrow_framing_md: narrowFramingMd.template,
      failure_routing_md: failureRoutingMd.template,
    }
  } else {
    const [securityMd, workflowMd, corePrinciplesMd, narrowFramingMd, failureRoutingMd] = await Promise.all([
      import('../templates/en/security_guidelines_md'),
      import('../templates/en/development_workflow_md'),
      import('../templates/en/core_principles_md'),
      import('../templates/en/prevent_narrow_framing_md'),
      import('../templates/en/failure_routing_md'),
    ])
    return {
      security_guidelines_md: securityMd.template,
      development_workflow_md: workflowMd.template,
      core_principles_md: corePrinciplesMd.template,
      prevent_narrow_framing_md: narrowFramingMd.template,
      failure_routing_md: failureRoutingMd.template,
    }
  }
}

function buildUserMessage(answers: Record<string, string>, lang: Lang): string {
  const labels =
    lang === 'ja'
      ? {
          domain: '分野',
          projectName: 'プロジェクト名',
          workType: '作業内容',
          tool: '使用ツール',
          goal: '目標',
          notes: '備考・要望',
        }
      : {
          domain: 'Domain',
          projectName: 'Project Name',
          workType: 'Work Type',
          tool: 'Tools',
          goal: 'Goal',
          notes: 'Additional Notes',
        }

  const vars = parseAnswers(answers, lang)
  const lines = [
    `${labels.domain}: ${vars.domain}`,
    `${labels.projectName}: ${vars.projectName}`,
    `${labels.workType}: ${vars.workType}`,
    `${labels.tool}: ${vars.tool}`,
    `${labels.goal}: ${vars.goal}`,
  ]

  const notes = answers['q6']?.trim()
  if (notes) {
    lines.push(`${labels.notes}: ${notes}`)
  }

  return lines.join('\n')
}

export async function generateLight(
  apiKey: string,
  lang: Lang,
  answers: Record<string, string>
): Promise<Blob> {
  const systemPrompt = getLightSystemPrompt(lang)
  const userMessage = buildUserMessage(answers, lang)

  let raw: string
  raw = await callClaude(apiKey, systemPrompt, userMessage)

  let apiFiles: ReturnType<typeof parseLightOutput>
  try {
    apiFiles = parseLightOutput(raw)
  } catch {
    // 出力切れ・パース失敗時は 2 回目で再試行（要件定義書 §4.4 #3）
    raw = await callClaude(apiKey, systemPrompt, userMessage)
    apiFiles = parseLightOutput(raw)
  }

  const staticTemplates = await loadStaticTemplates(lang)
  // 静的テンプレにも domain 適合（code/non-code）を適用する。
  // Light は stack 質問がないため q1（分野）/q4（ツール）の信号で判定する（domainProfiles.ts）。
  const vars = {
    ...parseAnswers(answers, lang),
    ...buildDomainVars(isCodeLight(answers), lang),
  }

  const allTemplates: Record<string, string> = {
    claude_md: apiFiles.claude_md,
    readme_md: apiFiles.readme_md,
    skill_md: apiFiles.skill_md,
    security_guidelines_md: render(staticTemplates.security_guidelines_md, vars),
    development_workflow_md: render(staticTemplates.development_workflow_md, vars),
    core_principles_md: render(staticTemplates.core_principles_md, vars),
    prevent_narrow_framing_md: render(staticTemplates.prevent_narrow_framing_md, vars),
    failure_routing_md: render(staticTemplates.failure_routing_md, vars),
  }

  const files = LIGHT_MANIFEST.map((entry) => {
    const content = allTemplates[entry.templateKey]
    if (!content) throw new Error(`Template not found: ${entry.templateKey}`)
    return { path: entry.zipPath, content }
  })

  return buildZip(files)
}
