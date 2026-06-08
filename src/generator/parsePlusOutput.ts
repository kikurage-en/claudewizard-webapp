import { extractJson, ParseError } from './parseClaudeOutput'

// ---------------------------------------------------------------------------
// 型（暫定・本スライス内部のテストフィクスチャ。プロンプト著作スライスで実出力に
// 合わせて改訂する acceptance gate を通すこと。Plan: Open items 参照）
// ---------------------------------------------------------------------------

export type Placement = 'CLAUDE_MD' | 'RULES' | 'HOOK' | 'SETTINGS' | 'SKILL'
export type Priority = 'critical' | 'high' | 'medium'
export type HookType = 'PreToolUse' | 'PostToolUse' | 'Stop' | 'Notification'

export type StructureElement = {
  placement: Placement
  content: string
  rationale: string
  priority: Priority
}

export type HookDefinition = {
  hookType: HookType
  matcher?: string
  command: string
  description: string
}

export type Step1StructureDesign = {
  projectSummary: string
  structureElements: StructureElement[]
  hookDefinitions: HookDefinition[]
  settingsRecommendations: string[]
}

export type Step3Output = {
  claude_md: string
  readme_md: string
}

export type Step4Output = {
  skill_md: string
  security_guidelines_md: string
  development_workflow_md: string
  coding_standards_md: string
}

export type HookEntry = {
  matcher?: string
  hooks: Array<{ type: 'command'; command: string }>
}

export type Step5Output = {
  hooks_config: { hooks: Record<string, HookEntry[]> }
  settings_json: Record<string, unknown>
  review_agent_md: string
}

const PLACEMENTS: readonly Placement[] = ['CLAUDE_MD', 'RULES', 'HOOK', 'SETTINGS', 'SKILL']
const PRIORITIES: readonly Priority[] = ['critical', 'high', 'medium']
const HOOK_TYPES: readonly HookType[] = ['PreToolUse', 'PostToolUse', 'Stop', 'Notification']

// ---------------------------------------------------------------------------
// 共通バリデーションヘルパー
// ---------------------------------------------------------------------------

function asObject(parsed: unknown, ctx: string): Record<string, unknown> {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ParseError(`${ctx}: expected object`)
  }
  return parsed as Record<string, unknown>
}

function requireString(obj: Record<string, unknown>, key: string, ctx: string): string {
  if (typeof obj[key] !== 'string') {
    throw new ParseError(`${ctx}: missing or non-string field: ${key}`)
  }
  return obj[key] as string
}

function requireArray(obj: Record<string, unknown>, key: string, ctx: string): unknown[] {
  if (!Array.isArray(obj[key])) {
    throw new ParseError(`${ctx}: missing or non-array field: ${key}`)
  }
  return obj[key] as unknown[]
}

function requireStringArray(obj: Record<string, unknown>, key: string, ctx: string): string[] {
  return requireArray(obj, key, ctx).map((v, i) => {
    if (typeof v !== 'string') throw new ParseError(`${ctx}.${key}[${i}]: expected string`)
    return v
  })
}

function requireEnum<T extends string>(
  obj: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  ctx: string
): T {
  const v = obj[key]
  if (typeof v !== 'string' || !allowed.includes(v as T)) {
    throw new ParseError(`${ctx}: invalid ${key}: ${String(v)}`)
  }
  return v as T
}

// ---------------------------------------------------------------------------
// 危険コマンド検査（security-guidelines.md 準拠。生成 hooks が実行する bash の最低限サニティ）
// ---------------------------------------------------------------------------

const DANGEROUS_HOOK_PATTERNS: readonly RegExp[] = [
  /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, // rm -rf / -fr（フラグ順不同）
  /\bdd\s+if=/i,
  /\bmkfs\b/i,
  /:\s*\(\s*\)\s*\{/, // fork bomb :(){
  /\bcurl\b[^|]*\|\s*(sh|bash)\b/i,
  /\bwget\b[^|]*\|\s*(sh|bash)\b/i,
  /\bsudo\b/i,
  /\bchmod\s+-R\b/i,
  /\bgit\b[^\n]*\bpush\b[^\n]*--force/i,
]

/** 安全なら true、危険パターンを含むなら false。 */
export function validateHookCommand(command: string): boolean {
  return !DANGEROUS_HOOK_PATTERNS.some((re) => re.test(command))
}

// ---------------------------------------------------------------------------
// Step パーサー
// ---------------------------------------------------------------------------

function parseStructureElement(el: unknown, i: number): StructureElement {
  const ctx = `Step1.structureElements[${i}]`
  const o = asObject(el, ctx)
  return {
    placement: requireEnum(o, 'placement', PLACEMENTS, ctx),
    content: requireString(o, 'content', ctx),
    rationale: requireString(o, 'rationale', ctx),
    priority: requireEnum(o, 'priority', PRIORITIES, ctx),
  }
}

function parseHookDefinition(el: unknown, i: number): HookDefinition {
  const ctx = `Step1.hookDefinitions[${i}]`
  const o = asObject(el, ctx)
  const base = {
    hookType: requireEnum(o, 'hookType', HOOK_TYPES, ctx),
    command: requireString(o, 'command', ctx),
    description: requireString(o, 'description', ctx),
  }
  return typeof o.matcher === 'string' ? { ...base, matcher: o.matcher } : base
}

export function parseStep1Output(raw: string): Step1StructureDesign {
  const obj = asObject(extractJson(raw), 'Step1')
  return {
    projectSummary: requireString(obj, 'projectSummary', 'Step1'),
    structureElements: requireArray(obj, 'structureElements', 'Step1').map(parseStructureElement),
    hookDefinitions: requireArray(obj, 'hookDefinitions', 'Step1').map(parseHookDefinition),
    settingsRecommendations: requireStringArray(obj, 'settingsRecommendations', 'Step1'),
  }
}

export function parseStep3Output(raw: string): Step3Output {
  const obj = asObject(extractJson(raw), 'Step3')
  return {
    claude_md: requireString(obj, 'claude_md', 'Step3'),
    readme_md: requireString(obj, 'readme_md', 'Step3'),
  }
}

export function parseStep4Output(raw: string): Step4Output {
  const obj = asObject(extractJson(raw), 'Step4')
  return {
    skill_md: requireString(obj, 'skill_md', 'Step4'),
    security_guidelines_md: requireString(obj, 'security_guidelines_md', 'Step4'),
    development_workflow_md: requireString(obj, 'development_workflow_md', 'Step4'),
    coding_standards_md: requireString(obj, 'coding_standards_md', 'Step4'),
  }
}

function parseHookEntry(entry: unknown, ctx: string): HookEntry {
  const o = asObject(entry, ctx)
  const inner = requireArray(o, 'hooks', ctx).map((h, i) => {
    const ho = asObject(h, `${ctx}.hooks[${i}]`)
    const command = requireString(ho, 'command', `${ctx}.hooks[${i}]`)
    if (!validateHookCommand(command)) {
      throw new ParseError(`${ctx}.hooks[${i}]: unsafe hook command rejected: ${command}`)
    }
    return { type: 'command' as const, command }
  })
  return typeof o.matcher === 'string' ? { matcher: o.matcher, hooks: inner } : { hooks: inner }
}

export function parseStep5Output(raw: string): Step5Output {
  const obj = asObject(extractJson(raw), 'Step5')
  const hooksConfig = asObject(obj['hooks_config'], 'Step5.hooks_config')
  const hooksRaw = asObject(hooksConfig['hooks'], 'Step5.hooks_config.hooks')

  const hooks: Record<string, HookEntry[]> = {}
  for (const [event, entriesRaw] of Object.entries(hooksRaw)) {
    if (!Array.isArray(entriesRaw)) {
      throw new ParseError(`Step5.hooks_config.hooks.${event}: expected array`)
    }
    hooks[event] = entriesRaw.map((e, i) => parseHookEntry(e, `Step5.hooks_config.hooks.${event}[${i}]`))
  }

  return {
    hooks_config: { hooks },
    settings_json: asObject(obj['settings_json'], 'Step5.settings_json'),
    review_agent_md: requireString(obj, 'review_agent_md', 'Step5'),
  }
}
