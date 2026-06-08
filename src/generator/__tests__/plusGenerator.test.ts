import { describe, it, expect, vi, beforeEach } from 'vitest'
import JSZip from 'jszip'

// vi.hoisted で巻き上げ（vi.mock factory 内参照）
const { mockCall } = vi.hoisted(() => ({ mockCall: vi.fn() }))

vi.mock('../../security/anthropicClient', () => ({
  callClaudeWithUsage: mockCall,
  AnthropicClientError: class AnthropicClientError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.code = code
      this.name = 'AnthropicClientError'
    }
  },
}))

vi.mock('../../security/promptLoader', () => ({
  getPlusSystemPrompt: (lang: string) => `plus system prompt ${lang}`,
}))

import { generatePlus, BudgetExceededError, MaxTokensError } from '../plusGenerator'
import { ParseError } from '../parseClaudeOutput'
import { AnthropicClientError } from '../../security/anthropicClient'
import { PLUS_MANIFEST } from '../../templates/manifest'

function resp(text: string, opts: { input?: number; output?: number; stop?: string } = {}) {
  return {
    text,
    inputTokens: opts.input ?? 100,
    outputTokens: opts.output ?? 200,
    stopReason: opts.stop ?? 'end_turn',
  }
}

const STEP1 = JSON.stringify({
  projectSummary: 'A TS CLI tool',
  structureElements: [
    { placement: 'CLAUDE_MD', content: 'core rules', rationale: 'always loaded', priority: 'critical' },
  ],
  hookDefinitions: [
    { hookType: 'PreToolUse', matcher: 'Bash', command: 'echo a', description: 'guard bash' },
    { hookType: 'Stop', command: 'echo b', description: 'notify on stop' },
  ],
  settingsRecommendations: ['allow Bash'],
})

const STEP1_EMPTY = JSON.stringify({
  projectSummary: 'minimal project',
  structureElements: [{ placement: 'RULES', content: 'c', rationale: 'r', priority: 'medium' }],
  hookDefinitions: [],
  settingsRecommendations: [],
})

const STEP3 = JSON.stringify({ claude_md: '# CLAUDE', readme_md: '# README' })
const STEP4 = JSON.stringify({
  skill_md: '# S',
  security_guidelines_md: '# sec',
  development_workflow_md: '# wf',
  coding_standards_md: '# cs',
})
const STEP5 = JSON.stringify({
  hooks_config: { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo ok' }] }] } },
  settings_json: { permissions: { allow: ['Bash'] } },
  review_agent_md: '# review',
})

const ANSWERS = { q1: 'software', q2: 'awesome-api', q3: 'create', q4: 'programming', q5: 'quality' }
const noop = () => Promise.resolve()

function happyPath(step1: string = STEP1) {
  mockCall
    .mockResolvedValueOnce(resp(step1))
    .mockResolvedValueOnce(resp(STEP3))
    .mockResolvedValueOnce(resp(STEP4))
    .mockResolvedValueOnce(resp(STEP5))
}

const unzip = (blob: Blob) => JSZip.loadAsync(blob)

describe('generatePlus', () => {
  beforeEach(() => {
    mockCall.mockReset()
  })

  it('正常系(ja): PLUS_MANIFEST 通り 9 ファイルの ZIP を返す', async () => {
    happyPath()
    const blob = await generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })
    const zip = await unzip(blob)
    const entries = Object.values(zip.files).filter((f) => !f.dir).map((f) => f.name).sort()
    const expected = PLUS_MANIFEST.map((e) => e.zipPath).sort()
    expect(entries).toEqual(expected)
    expect(entries).toHaveLength(9)
  })

  it('Step1→3→4→5 の順で呼ばれ、Step1 結果が後続 userMessage に渡る', async () => {
    happyPath()
    await generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })
    expect(mockCall).toHaveBeenCalledTimes(4)
    const msgs = mockCall.mock.calls.map((c) => c[2] as string)
    expect(msgs[0]).toContain('Step 1')
    expect(msgs[1]).toContain('Step 3')
    expect(msgs[1]).toContain('A TS CLI tool') // Step1 構造設計が Step3 に埋め込まれている
    expect(msgs[2]).toContain('Step 4')
    expect(msgs[3]).toContain('Step 5')
    // system prompt は言語連動
    expect(mockCall.mock.calls[0][1]).toBe('plus system prompt ja')
  })

  it('正常系(en): 9 ファイル + 構造設計レポートが英語ラベル', async () => {
    happyPath()
    const blob = await generatePlus('sk-ant', 'en', ANSWERS, { sleep: noop })
    const zip = await unzip(blob)
    const report = await zip.file('.claude/reports/structure-design.md')!.async('string')
    expect(report).toContain('# Structure Design Report')
    expect(report).toContain('Placement Design')
    expect(Object.values(zip.files).filter((f) => !f.dir)).toHaveLength(9)
  })

  it('Step1 パース失敗 → 同一引数で1回リトライ → 成功（総5回、後続は各1回）', async () => {
    mockCall
      .mockResolvedValueOnce(resp('not json'))
      .mockResolvedValueOnce(resp(STEP1))
      .mockResolvedValueOnce(resp(STEP3))
      .mockResolvedValueOnce(resp(STEP4))
      .mockResolvedValueOnce(resp(STEP5))
    await generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })
    expect(mockCall).toHaveBeenCalledTimes(5)
    // リトライは同一 userMessage（前 Step 結果を使い回さないことの証明）
    expect(mockCall.mock.calls[0][2]).toBe(mockCall.mock.calls[1][2])
  })

  it('Step3 が2回パース失敗 → ParseError、Step4/5 未実行（総3回）', async () => {
    mockCall
      .mockResolvedValueOnce(resp(STEP1))
      .mockResolvedValueOnce(resp('bad'))
      .mockResolvedValueOnce(resp('bad'))
    await expect(generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })).rejects.toThrow(ParseError)
    expect(mockCall).toHaveBeenCalledTimes(3)
  })

  it('settings.json は有効な JSON で hooks がマージされる', async () => {
    happyPath()
    const blob = await generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })
    const zip = await unzip(blob)
    const raw = await zip.file('.claude/settings.json')!.async('string')
    const parsed = JSON.parse(raw)
    expect(parsed.permissions).toMatchObject({ allow: ['Bash'] })
    expect(parsed.hooks.PreToolUse[0].hooks[0].command).toBe('echo ok')
  })

  it('予算超過で BudgetExceededError、Step3 未実行（総1回）', async () => {
    mockCall.mockResolvedValueOnce(resp(STEP1, { input: 40_000, output: 40_000 }))
    await expect(
      generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop, tokenBudget: 60_000 })
    ).rejects.toThrow(BudgetExceededError)
    expect(mockCall).toHaveBeenCalledTimes(1)
  })

  it('AnthropicClientError はリトライせず透過（総1回）', async () => {
    mockCall.mockRejectedValueOnce(new AnthropicClientError('unauthorized', 'auth'))
    await expect(generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })).rejects.toThrow('unauthorized')
    expect(mockCall).toHaveBeenCalledTimes(1)
  })

  it('Step 間インターバルが 3 回挿入される', async () => {
    happyPath()
    const sleepFn = vi.fn().mockResolvedValue(undefined)
    await generatePlus('sk-ant', 'ja', ANSWERS, { sleep: sleepFn })
    expect(sleepFn).toHaveBeenCalledTimes(3)
  })

  it('空 hookDefinitions/settingsRecommendations は (none) と整形される', async () => {
    happyPath(STEP1_EMPTY)
    const blob = await generatePlus('sk-ant', 'en', ANSWERS, { sleep: noop })
    const zip = await unzip(blob)
    const report = await zip.file('.claude/reports/structure-design.md')!.async('string')
    expect(report).toContain('(none)')
    expect(Object.values(zip.files).filter((f) => !f.dir)).toHaveLength(9)
  })

  it('Step1 max_tokens → リトライ → 成功（総5回）', async () => {
    mockCall
      .mockResolvedValueOnce(resp(STEP1, { stop: 'max_tokens' }))
      .mockResolvedValueOnce(resp(STEP1))
      .mockResolvedValueOnce(resp(STEP3))
      .mockResolvedValueOnce(resp(STEP4))
      .mockResolvedValueOnce(resp(STEP5))
    await generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })
    expect(mockCall).toHaveBeenCalledTimes(5)
  })

  it('Step3 が2回 max_tokens → MaxTokensError', async () => {
    mockCall
      .mockResolvedValueOnce(resp(STEP1))
      .mockResolvedValueOnce(resp(STEP3, { stop: 'max_tokens' }))
      .mockResolvedValueOnce(resp(STEP3, { stop: 'max_tokens' }))
    await expect(generatePlus('sk-ant', 'ja', ANSWERS, { sleep: noop })).rejects.toThrow(MaxTokensError)
    expect(mockCall).toHaveBeenCalledTimes(3)
  })

  it('q6（備考・要望）が userMessage に反映される', async () => {
    happyPath()
    await generatePlus('sk-ant', 'ja', { ...ANSWERS, q6: 'TypeScript 中心で' }, { sleep: noop })
    expect(mockCall.mock.calls[0][2]).toContain('TypeScript 中心で')
  })

  it('既定 sleep（注入なし）でも完走する（defaultSleep カバレッジ）', async () => {
    vi.useFakeTimers()
    try {
      happyPath()
      const promise = generatePlus('sk-ant', 'ja', ANSWERS)
      await vi.runAllTimersAsync()
      const blob = await promise
      expect(blob).toBeInstanceOf(Blob)
    } finally {
      vi.useRealTimers()
    }
  })
})
