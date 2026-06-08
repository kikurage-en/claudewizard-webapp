import {
  callClaudeWithUsage,
  type ClaudeResponseWithUsage,
} from '../security/anthropicClient'
import { getPlusSystemPrompt } from '../security/promptLoader'
import { ParseError } from './parseClaudeOutput'
import {
  parseStep1Output,
  parseStep3Output,
  parseStep4Output,
  parseStep5Output,
  type Step1StructureDesign,
  type Step3Output,
  type Step4Output,
  type Step5Output,
} from './parsePlusOutput'
import { parseAnswers } from './parseAnswers'
import { buildZip, type ZipFile } from './zipBuilder'
import { PLUS_MANIFEST } from '../templates/manifest'

type Lang = 'ja' | 'en'

// 予算/インターバルは options 注入で上書き可能（テストの即時化・将来のチューニング用）。
// 既定値は runaway/課金事故の上限ガード（api-documentation.md「AI/API利用の安全制御」MUST）。
// 暫定 60_000 はプロンプト著作後に実測トークンで再調整する（Plan: Open items）。
export const DEFAULT_PLUS_TOKEN_BUDGET = 60_000
export const STEP_INTERVAL_MS = 600

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export type GeneratePlusOptions = {
  tokenBudget?: number
  sleep?: (ms: number) => Promise<void>
}

/** 累積トークンが上限超過で後続ステップを停止する（runaway 防止）。 */
export class BudgetExceededError extends Error {
  constructor(
    public readonly total: number,
    public readonly limit: number
  ) {
    super(`Token budget exceeded: ${total} > ${limit}`)
    this.name = 'BudgetExceededError'
  }
}

/** stop_reason==='max_tokens' による出力切れ。ParseError 派生でリトライ対象に含める。 */
export class MaxTokensError extends ParseError {
  constructor(step: string) {
    super(`${step}: output truncated (stop_reason=max_tokens)`)
    this.name = 'MaxTokensError'
  }
}

type TokenBudgetState = { input: number; output: number }

function checkBudget(b: TokenBudgetState, limit: number): void {
  const total = b.input + b.output
  if (total > limit) throw new BudgetExceededError(total, limit)
}

/**
 * 1 ステップを実行。パース失敗 / max_tokens（=ParseError 派生）時のみ同一引数で 1 回再試行。
 * AnthropicClientError 等の API エラーは SDK が max_retries=2 済みのため二重化せず即スロー
 * （api-documentation.md MUST NOT: 独自 retry の二重化）。
 */
async function runStep<T>(
  label: string,
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  parse: (raw: string) => T,
  budget: TokenBudgetState,
  tokenBudget: number
): Promise<T> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    const res: ClaudeResponseWithUsage = await callClaudeWithUsage(apiKey, systemPrompt, userMessage)
    budget.input += res.inputTokens
    budget.output += res.outputTokens
    // 各 API 呼び出し後に予算判定（超過なら後続ステップへ進まず即停止）
    checkBudget(budget, tokenBudget)

    if (res.stopReason === 'max_tokens') {
      lastErr = new MaxTokensError(label)
      continue
    }
    try {
      return parse(res.text)
    } catch (err) {
      if (err instanceof ParseError) {
        lastErr = err
        continue
      }
      throw err
    }
  }
  throw lastErr ?? new ParseError(`${label}: retries exhausted`)
}

// ---------------------------------------------------------------------------
// user message 構築（指示本文＝IP は system prompt 側。ここはデータ + step マーカーのみ）
// ---------------------------------------------------------------------------

function answerSummary(answers: Record<string, string>, lang: Lang): string {
  const labels =
    lang === 'ja'
      ? { domain: '分野', projectName: 'プロジェクト名', workType: '作業内容', tool: '使用ツール', goal: '目標', notes: '備考・要望' }
      : { domain: 'Domain', projectName: 'Project Name', workType: 'Work Type', tool: 'Tools', goal: 'Goal', notes: 'Additional Notes' }
  const vars = parseAnswers(answers, lang)
  const lines = [
    `${labels.domain}: ${vars.domain}`,
    `${labels.projectName}: ${vars.projectName}`,
    `${labels.workType}: ${vars.workType}`,
    `${labels.tool}: ${vars.tool}`,
    `${labels.goal}: ${vars.goal}`,
  ]
  const notes = answers['q6']?.trim()
  if (notes) lines.push(`${labels.notes}: ${notes}`)
  return lines.join('\n')
}

function buildStep1Message(answers: Record<string, string>, lang: Lang): string {
  const header = lang === 'ja' ? '# Step 1: 構造設計\n\n## プロジェクト回答' : '# Step 1: Structure Design\n\n## Project Answers'
  return `${header}\n${answerSummary(answers, lang)}`
}

function buildStepMessage(
  step: 3 | 4 | 5,
  answers: Record<string, string>,
  lang: Lang,
  step1: Step1StructureDesign
): string {
  const header = lang === 'ja' ? `# Step ${step}` : `# Step ${step}`
  const answersLabel = lang === 'ja' ? '## プロジェクト回答' : '## Project Answers'
  const designLabel = lang === 'ja' ? '## Step1 構造設計 (JSON)' : '## Step1 Structure Design (JSON)'
  return [
    header,
    '',
    answersLabel,
    answerSummary(answers, lang),
    '',
    designLabel,
    JSON.stringify(step1, null, 2),
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Step 6（JS）: 構造設計レポート整形 + settings.json マージ + ファイルアセンブル
// ---------------------------------------------------------------------------

function formatStructureReport(s: Step1StructureDesign, lang: Lang): string {
  const L =
    lang === 'ja'
      ? { title: '# 構造設計レポート', summary: '## プロジェクト概要', elements: '## 配置設計', hooks: '## hooks 設計', settings: '## settings.json 推奨', rationale: '理由', none: '（なし）' }
      : { title: '# Structure Design Report', summary: '## Project Overview', elements: '## Placement Design', hooks: '## Hooks Design', settings: '## settings.json Recommendations', rationale: 'Rationale', none: '(none)' }

  const lines: string[] = [L.title, '', L.summary, '', s.projectSummary, '', L.elements, '']
  for (const el of s.structureElements) {
    lines.push(`- **${el.placement}** (${el.priority}): ${el.content}`)
    lines.push(`  - ${L.rationale}: ${el.rationale}`)
  }
  lines.push('', L.hooks, '')
  if (s.hookDefinitions.length === 0) {
    lines.push(L.none)
  } else {
    for (const h of s.hookDefinitions) {
      lines.push(`- ${h.hookType}${h.matcher ? ` (${h.matcher})` : ''}: ${h.description}`)
    }
  }
  lines.push('', L.settings, '')
  if (s.settingsRecommendations.length === 0) {
    lines.push(L.none)
  } else {
    for (const rec of s.settingsRecommendations) lines.push(`- ${rec}`)
  }
  return lines.join('\n') + '\n'
}

type PlusStepResults = {
  step1: Step1StructureDesign
  step3: Step3Output
  step4: Step4Output
  step5: Step5Output
}

function assemblePlusFiles(r: PlusStepResults, lang: Lang): ZipFile[] {
  // hooks は settings.json の hooks キーに統合（要件確認済み）
  const settingsObj = { ...r.step5.settings_json, hooks: r.step5.hooks_config.hooks }
  const contentByKey: Record<string, string> = {
    claude_md: r.step3.claude_md,
    readme_md: r.step3.readme_md,
    skill_md: r.step4.skill_md,
    security_guidelines_md: r.step4.security_guidelines_md,
    development_workflow_md: r.step4.development_workflow_md,
    coding_standards_md: r.step4.coding_standards_md,
    review_agent_md: r.step5.review_agent_md,
    settings_json: JSON.stringify(settingsObj, null, 2),
    structure_design_report: formatStructureReport(r.step1, lang),
  }
  return PLUS_MANIFEST.map((entry) => {
    const content = contentByKey[entry.templateKey]
    if (content === undefined) throw new Error(`Plus content not found: ${entry.templateKey}`)
    return { path: entry.zipPath, content }
  })
}

// ---------------------------------------------------------------------------
// オーケストレーション本体
//   注意: 本関数は export のみ。generate() への live 配線はライセンスゲートと atomic に
//   後続スライス(E)で行う（gate 無き生成経路を作らない / Adversarial review F1）。
// ---------------------------------------------------------------------------

export async function generatePlus(
  apiKey: string,
  lang: Lang,
  answers: Record<string, string>,
  options: GeneratePlusOptions = {}
): Promise<Blob> {
  const tokenBudget = options.tokenBudget ?? DEFAULT_PLUS_TOKEN_BUDGET
  const sleep = options.sleep ?? defaultSleep
  const systemPrompt = getPlusSystemPrompt(lang)
  const budget: TokenBudgetState = { input: 0, output: 0 }

  const step1 = await runStep('Step1', apiKey, systemPrompt, buildStep1Message(answers, lang), parseStep1Output, budget, tokenBudget)
  await sleep(STEP_INTERVAL_MS)

  const step3 = await runStep('Step3', apiKey, systemPrompt, buildStepMessage(3, answers, lang, step1), parseStep3Output, budget, tokenBudget)
  await sleep(STEP_INTERVAL_MS)

  const step4 = await runStep('Step4', apiKey, systemPrompt, buildStepMessage(4, answers, lang, step1), parseStep4Output, budget, tokenBudget)
  await sleep(STEP_INTERVAL_MS)

  const step5 = await runStep('Step5', apiKey, systemPrompt, buildStepMessage(5, answers, lang, step1), parseStep5Output, budget, tokenBudget)

  const files = assemblePlusFiles({ step1, step3, step4, step5 }, lang)
  return buildZip(files)
}
