import type { TemplateVars } from './render'

// domain 適合（code 系 / non-code 系の 2 分岐）。
// 設計方針:
// - code 系の値は既存テンプレ文言を byte 一致で保持する（既存出力を変えない）。
// - non-code 系のみ、成果物ワークフロー（文章・SNS・デザイン等）向けに翻案する。
// - stackProfiles と同じく、記入指示（命令形「〜を書く」等）を使わない完成文にする。
//
// isCode 判定はプランごとに入力が異なる:
// - Free: stack 軸を優先（stack=non-code のみ non-code。未回答は other-code 扱い= code）
// - Light: stack 質問がないため、q1（分野）と q4（ツール）のどちらかのコード系信号で code

const CODE_DOMAINS = ['software', 'data-research', 'automation']
const CODE_TOOLS = ['programming', 'cli']

export function isCodeFree(stackValue: string | undefined): boolean {
  return (stackValue ?? 'other-code') !== 'non-code'
}

export function isCodeLight(answers: Record<string, string>): boolean {
  return CODE_DOMAINS.includes(answers['q1'] ?? '') || CODE_TOOLS.includes(answers['q4'] ?? '')
}

type DomainVars = {
  workRules: string
  reviewDescription: string
  securityMustNotExtra: string
  securityMustExtra: string
  securityDomainSections: string
  implementWhileRule: string
  completionCheckRule: string
  reviewChecklistRule: string
  reviewCriteriaFirst: string
  failureReflectionCriteria: string
  // /init 育成フローの案内（code 系のみ。/init はコード分析ツールのため non-code は空）。
  // CLAUDE.md 側は HTML コメント＝公式仕様で context 注入前に剥離される（保守者向け・トークン非消費）。
  initGuidanceComment: string
  initGuidanceSection: string
}

const CODE: Record<'ja' | 'en', DomainVars> = {
  ja: {
    workRules: [
      '- MUST: 問題を解決する最小限の変更にとどめる（投機的な実装をしない）',
      '- MUST: 触る必要のある箇所だけ変更する（無関係な整形・改善をしない）',
      '- MUST: コードを書く前に、関連する既存コード・呼び出し元・共有処理を読む',
      '- MUST: テストは「なぜその挙動が重要か」を検証する（挙動の丸写しにしない）',
      '- MUST: 既存コードベースの規約に合わせる',
      '- MUST NOT: スキップした作業を「完了」と報告しない',
    ].join('\n'),
    reviewDescription: '変更差分を確認し、品質・セキュリティ観点でコメントする。',
    securityMustNotExtra: [
      '- 未検証の外部入力を直接実行または評価しない',
      '- 脆弱な暗号化アルゴリズムを使用しない',
    ].join('\n'),
    securityMustExtra: [
      '- すべての外部入力を検証・サニタイズする',
      '- 依存関係の脆弱性を定期的にチェックする（`npm audit` 等）',
    ].join('\n'),
    securityDomainSections: [
      '## 入力値の検証',
      '',
      '- ユーザー入力は必ず検証する',
      '- SQLインジェクション、XSS等の攻撃を防ぐ',
      '- ファイルアップロードは種類・サイズを制限する',
      '',
      '## 依存関係',
      '',
      '- パッケージのバージョンを固定する（lockfile 管理）',
      '- 既知の脆弱性があるパッケージを使用しない',
      '- 不要な依存を最小化する',
    ].join('\n'),
    implementWhileRule: 'テストを書きながら実装する（TDD 推奨）',
    completionCheckRule: 'テストが全件合格することを確認する',
    reviewChecklistRule: 'コードレビューチェックリストを確認する',
    reviewCriteriaFirst: '意図・理由が理解できるコードか',
    failureReflectionCriteria: '「検知 → 通知 → 後続処理」の 3 段が成立しているコード位置を提示する',
    initGuidanceComment: [
      '',
      '<!--',
      '  この設定は初期状態です。コードが増えてきたら Claude Code で /init を実行してください。',
      '  Build & Test・Architecture が実コードから検出され、既存の CLAUDE.md は上書きされず',
      '  改善提案として統合できます（公式仕様）。',
      '-->',
    ].join('\n'),
    initGuidanceSection: [
      '## CLAUDE.md の育て方',
      '',
      'この設定ファイル一式は初期状態（出発点）です。実装が進んでコードが増えたら、Claude Code で `/init` を実行してください。',
      'ビルドコマンドやディレクトリ構成が実コードから検出され、既存の CLAUDE.md は上書きされず改善提案として統合できます。',
      '',
      '',
    ].join('\n'),
  },
  en: {
    workRules: [
      '- MUST: Make the minimum change that solves the problem (nothing speculative)',
      '- MUST: Touch only what you must (no unrelated reformatting or "improvements")',
      '- MUST: Read related existing code, callers, and shared utilities before writing',
      '- MUST: Tests verify WHY the behavior matters (not just WHAT it does)',
      '- MUST: Match the existing codebase conventions',
      '- MUST NOT: Report skipped work as "completed"',
    ].join('\n'),
    reviewDescription: 'Review the diff and comment from quality and security perspectives.',
    securityMustNotExtra: [
      '- Directly execute or evaluate unvalidated external input',
      '- Use vulnerable cryptographic algorithms',
    ].join('\n'),
    securityMustExtra: [
      '- Validate and sanitize all external input',
      '- Regularly check dependencies for vulnerabilities (`npm audit`, etc.)',
    ].join('\n'),
    securityDomainSections: [
      '## Input Validation',
      '',
      '- Always validate user input',
      '- Prevent attacks like SQL injection, XSS, etc.',
      '- Restrict file uploads by type and size',
      '',
      '## Dependencies',
      '',
      '- Pin package versions (manage lockfile)',
      '- Do not use packages with known vulnerabilities',
      '- Minimize unnecessary dependencies',
    ].join('\n'),
    implementWhileRule: 'Write tests alongside implementation (TDD recommended)',
    completionCheckRule: 'Ensure all tests pass',
    reviewChecklistRule: 'Go through the code review checklist',
    reviewCriteriaFirst: 'Is the intent and reasoning understandable from the code?',
    failureReflectionCriteria: 'point to the code location where "detect -> notify -> downstream" all hold',
    initGuidanceComment: [
      '',
      '<!--',
      '  This configuration is a starting point. Once the codebase grows, run /init in Claude Code.',
      '  It detects Build & Test commands and architecture from the actual code, and suggests',
      '  improvements without overwriting this CLAUDE.md (official behavior).',
      '-->',
    ].join('\n'),
    initGuidanceSection: [
      '## Growing Your CLAUDE.md',
      '',
      'This configuration set is a starting point. As your codebase grows, run `/init` in Claude Code.',
      'It detects build commands and project structure from the actual code, and suggests improvements without overwriting your existing CLAUDE.md.',
      '',
      '',
    ].join('\n'),
  },
}

const NON_CODE: Record<'ja' | 'en', DomainVars> = {
  ja: {
    workRules: [
      '- MUST: 目的を満たす最小限の変更にとどめる（頼まれていない作り込みをしない）',
      '- MUST: 触る必要のある箇所だけ変更する（無関係な手直し・装飾をしない）',
      '- MUST: 作成の前に、既存の成果物・関連資料・過去の決定事項を確認する',
      '- MUST: 完成基準（誰向けか・何ができれば完成か）を先に確認してから作業する',
      '- MUST: 既存の成果物のトーン・形式・用語に合わせる',
      '- MUST NOT: スキップした作業を「完了」と報告しない',
    ].join('\n'),
    reviewDescription: '成果物を確認し、品質・整合性の観点でコメントする。',
    securityMustNotExtra: [
      '- 出所不明のファイル・リンク・埋め込みコンテンツをそのまま利用しない',
      '- 個人情報・取引先情報を公開する成果物に含めない',
    ].join('\n'),
    securityMustExtra: [
      '- 外部から得た情報・素材は出所と利用条件を確認してから使う',
      '- 利用している外部ツール・サービスの提供元と権限設定を定期的に確認する',
    ].join('\n'),
    securityDomainSections: [
      '## 情報の取り扱い',
      '',
      '- 公開・共有の前に機密情報・個人情報が含まれていないか確認する',
      '- 引用・転載は出典と利用条件を確認する',
      '- 共有リンク・公開範囲の設定を必要最小限にする',
      '',
      '## 利用ツール・サービス',
      '',
      '- 公式の提供元から入手したツールのみ利用する',
      '- 連携アプリ・拡張機能の権限を定期的に見直す',
      '- 使っていない連携・アカウントを放置しない',
    ].join('\n'),
    implementWhileRule: '下書き → 推敲 の段階を分けて作成する',
    completionCheckRule: '成果物が目的・完成基準を満たすことを確認する',
    reviewChecklistRule: 'レビュー観点（整合性・誤字・トーン）を確認する',
    reviewCriteriaFirst: '意図・背景が理解できる成果物か',
    failureReflectionCriteria: '「検知 → 通知 → 後続対応」の 3 段が成立する手順・チェックリストを提示する',
    initGuidanceComment: '',
    initGuidanceSection: '',
  },
  en: {
    workRules: [
      '- MUST: Make the minimum change that meets the goal (nothing beyond what was asked)',
      '- MUST: Touch only what you must (no unrelated rewording or embellishment)',
      '- MUST: Check existing deliverables, related materials, and past decisions before creating',
      '- MUST: Confirm the definition of done (audience and acceptance) before starting',
      '- MUST: Match the tone, format, and terminology of existing deliverables',
      '- MUST NOT: Report skipped work as "completed"',
    ].join('\n'),
    reviewDescription: 'Review the deliverable and comment from quality and consistency perspectives.',
    securityMustNotExtra: [
      '- Use files, links, or embedded content from unknown sources as-is',
      '- Include personal or client information in published deliverables',
    ].join('\n'),
    securityMustExtra: [
      '- Verify the source and usage terms of externally obtained information and materials before use',
      '- Regularly review the providers and permission settings of external tools and services in use',
    ].join('\n'),
    securityDomainSections: [
      '## Information Handling',
      '',
      '- Check for sensitive or personal information before publishing or sharing',
      '- Verify sources and usage terms before quoting or reusing content',
      '- Keep sharing links and visibility settings to the minimum necessary',
      '',
      '## Tools & Services',
      '',
      '- Only use tools obtained from official providers',
      '- Periodically review permissions of connected apps and extensions',
      '- Do not leave unused integrations or accounts active',
    ].join('\n'),
    implementWhileRule: 'Create in stages: draft first, then refine',
    completionCheckRule: 'Confirm the deliverable meets the goal and the definition of done',
    reviewChecklistRule: 'Go through the review points (consistency, typos, tone)',
    reviewCriteriaFirst: 'Is the intent and background understandable from the deliverable?',
    failureReflectionCriteria: 'point to the procedure or checklist where "detect -> notify -> follow-up" all hold',
    initGuidanceComment: '',
    initGuidanceSection: '',
  },
}

/**
 * code / non-code グループに応じたセクション単位の変数を返す。
 * Free は isCodeFree(stack)、Light は isCodeLight(answers) で判定した結果を渡す。
 */
export function buildDomainVars(isCode: boolean, lang: 'ja' | 'en'): TemplateVars {
  return { ...(isCode ? CODE : NON_CODE)[lang] }
}
