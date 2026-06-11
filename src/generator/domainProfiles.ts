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

// 分野コンテンツ（q1 7-way・Free 専用）。接地元:
// - CLI 版 generation.md の分野別重点テーブル（コンテンツ=事実確認・引用検証 / 調査研究=データ検証・
//   出典確認 / 自動化=動作確認・影響範囲 / 開発=テスト要件・レビュー基準）
// - 公式 skills repo の設計基準（description に起動キーワード=undertrigger 対策、Gotchas が最高価値）
// - design は CLI に対応分野がないため公式 skills repo（brand-guidelines / canvas-design）に接地
// rules 4 ファイルは普遍（CLI 原則）— 分野個性は SKILL.md と CLAUDE.md 作業ルールのみに出す。
// 分野軸は code/non-code 軸と直交（例: writing×ts は code 系作業ルール + writing 分野個性）。
type DomainContentVars = {
  skillTriggers: string // SKILL frontmatter 起動条件の分野フレーズ（読点・「等」込み）
  verifyFocus: string // SKILL /verify の分野観点（先頭改行込み）
  reviewDescription: string // SKILL /review の分野説明（other は isCode 2-way へフォールバック）
  skillGotchas: string // SKILL「よくある落とし穴」節（見出しごと。空なら節なし）
  domainWorkRules: string // CLAUDE.md 作業ルール末尾の分野規律（先頭改行込み・≤2 行）
}

const DOMAIN_CONTENT: Record<string, Record<'ja' | 'en', DomainContentVars>> = {
  software: {
    ja: {
      skillTriggers: '、「実装を始める」「テストを書く」「リファクタリングする」等',
      verifyFocus:
        '\n特に: テストが意図（なぜその挙動が重要か）を検証しているか。型チェック通過をテストの代替にしない。',
      reviewDescription: '変更差分を確認し、テスト意図・回帰リスク・セキュリティ観点でコメントする。',
      skillGotchas: [
        '## よくある落とし穴',
        '',
        '- 型が合っていても挙動は壊れうる。挙動はテストでしか証明されない',
        '- ライブラリの API は記憶でなく公式ドキュメントで確認する（バージョン差異で壊れる）',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: 外部ライブラリ・API の仕様は公式ドキュメントで確認してから使う',
    },
    en: {
      skillTriggers: ', "start implementing", "write tests", "refactor", etc.',
      verifyFocus:
        '\nFocus: do tests verify WHY the behavior matters? Passing type checks is no substitute for tests.',
      reviewDescription: 'Review the diff for test intent, regression risk, and security.',
      skillGotchas: [
        '## Common Pitfalls',
        '',
        '- Passing types do not prove behavior; behavior is only proven by tests',
        '- Check library APIs in the official docs, not from memory (they break across version differences)',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: Check external library/API behavior in the official docs before using it',
    },
  },
  'data-research': {
    ja: {
      skillTriggers: '、「データを集計する」「調査をまとめる」「分析する」等',
      verifyFocus: '\n特に: 数値が元データから再計算で一致するか。事実と推測が区別されているか。',
      reviewDescription: '集計・分析結果を確認し、データの出所・再現性・解釈の妥当性をコメントする。',
      skillGotchas: [
        '## よくある落とし穴',
        '',
        '- 出所の確認できないデータを分析の前提にしない（後工程がすべて無効になる）',
        '- 集計の途中でフィルタ条件を変えたら、それ以前の数値はすべて出し直す',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: 数値・引用には出所（URL・ファイル名・取得日）を明記する',
    },
    en: {
      skillTriggers: ', "aggregate data", "summarize research", "analyze", etc.',
      verifyFocus: '\nFocus: do figures recompute from the raw data? Are facts and inferences kept separate?',
      reviewDescription:
        'Review results for the source of the data, reproducibility, and soundness of interpretation.',
      skillGotchas: [
        '## Common Pitfalls',
        '',
        '- Never build analysis on data whose origin cannot be verified (everything downstream becomes invalid)',
        '- If you change filter conditions mid-aggregation, redo all earlier figures',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: State the source (URL, file name, retrieval date) for every figure and quote',
    },
  },
  writing: {
    ja: {
      skillTriggers: '、「記事を書きたい」「原稿をレビューする」「構成を考える」等',
      verifyFocus: '\n特に: 想定読者に対してトーン・難易度が一致しているか。引用・事実の出典が確認できるか。',
      reviewDescription: '原稿を確認し、想定読者との整合・事実誤認・誤字脱字をコメントする。',
      skillGotchas: [
        '## よくある落とし穴',
        '',
        '- 着手前に想定読者と目的を 1 行で確認する（途中変更は全体の書き直しになる）',
        '- 引用は原文に当たって確認する（孫引きは誤りが伝播する）',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: 事実の記述は出典を確認し、推測は推測と明示する',
    },
    en: {
      skillTriggers: ', "draft an article", "review a manuscript", "plan an outline", etc.',
      verifyFocus:
        '\nFocus: do tone and difficulty match the target audience? Are quotes and facts traceable to sources?',
      reviewDescription: 'Review the manuscript for audience fit, factual errors, and typos.',
      skillGotchas: [
        '## Common Pitfalls',
        '',
        '- Confirm the target audience and purpose in one line before starting (changing them mid-draft means a full rewrite)',
        '- Verify quotes against the original source (secondhand quotes propagate errors)',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: Verify sources for factual statements, and state inferences as inferences',
    },
  },
  sns: {
    ja: {
      skillTriggers: '、「投稿文を作る」「投稿カレンダーを作る」「リプライ案を考える」等',
      verifyFocus: '\n特に: プラットフォーム規約・文字数制限に収まっているか。投稿前の事実確認が済んでいるか。',
      reviewDescription: '投稿文面を確認し、事実誤認・規約抵触・トーン不一致をコメントする。',
      skillGotchas: [
        '## よくある落とし穴',
        '',
        '- プラットフォームごとに文字数・画像規格・リンク仕様が違う（同じ文面の使い回しは崩れる）',
        '- 予約投稿は宛先アカウントと公開範囲を設定時に再確認する',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST NOT: 未確認の情報を断定形で投稿文にしない',
    },
    en: {
      skillTriggers: ', "draft a post", "build a content calendar", "draft replies", etc.',
      verifyFocus: '\nFocus: within platform rules and character limits? Facts checked before posting?',
      reviewDescription: 'Review post copy for factual errors, policy violations, and tone mismatch.',
      skillGotchas: [
        '## Common Pitfalls',
        '',
        '- Character limits, image specs, and link behavior differ per platform (reusing the same copy breaks)',
        '- For scheduled posts, re-check the destination account and visibility at scheduling time',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST NOT: State unverified information as established fact in post copy',
    },
  },
  automation: {
    ja: {
      skillTriggers: '、「定型作業を自動化する」「スクリプトを組む」「バッチ処理を作る」等',
      verifyFocus:
        '\n特に: dry-run で影響範囲を確認したか。途中失敗時に安全に停止し、再実行で二重処理にならないか。',
      reviewDescription: '自動化フローを確認し、影響範囲・失敗時挙動・冪等性をコメントする。',
      skillGotchas: [
        '## よくある落とし穴',
        '',
        '- 本実行の前に必ず dry-run（または対象 1 件の試行）で影響範囲を確認する',
        '- 日時を扱う処理はタイムゾーンを明示する（実行環境で既定値が変わる）',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: 一括処理は dry-run か少数試行で影響範囲を確認してから本実行する',
    },
    en: {
      skillTriggers: ', "automate a routine task", "write a script", "set up a batch job", etc.',
      verifyFocus:
        '\nFocus: was the scope verified with a dry-run? Does it stop safely on failure and re-run without double-processing?',
      reviewDescription: 'Review the automation for scope of impact, failure behavior, and idempotency.',
      skillGotchas: [
        '## Common Pitfalls',
        '',
        '- Always verify the scope with a dry-run (or a trial on a single item) before the real run',
        '- Make time zones explicit in anything date/time-related (defaults vary by environment)',
        '',
        '',
      ].join('\n'),
      domainWorkRules:
        '\n- MUST: Verify the scope of bulk operations with a dry-run or small trial before the real run',
    },
  },
  design: {
    ja: {
      skillTriggers: '、「バナーを作る」「スライドをデザインする」「ロゴ案を出す」等',
      verifyFocus:
        '\n特に: ブランドのカラー・フォント・トーンと整合しているか。素材のライセンスと出力設定（解像度・形式）が用途に合うか。',
      reviewDescription: '制作物を確認し、ブランド整合・素材ライセンス・出力設定をコメントする。',
      skillGotchas: [
        '## よくある落とし穴',
        '',
        '- 素材は使用前にライセンスを確認する（クレジット要否・改変可否まで）',
        '- 書き出し設定（解像度・色空間・形式）は掲載先の要求仕様から逆算する',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: 外部素材は商用利用可否とライセンスを確認してから使う',
    },
    en: {
      skillTriggers: ', "create a banner", "design slides", "sketch logo concepts", etc.',
      verifyFocus:
        '\nFocus: consistent with brand colors, fonts, and tone? Do the asset license and export settings (resolution, format) fit the use?',
      reviewDescription: 'Review the deliverable for brand consistency, asset licensing, and export settings.',
      skillGotchas: [
        '## Common Pitfalls',
        '',
        '- Check the license before using any external material (including credit and modification rights)',
        '- Derive export settings (resolution, color space, format) from the destination\'s requirements',
        '',
        '',
      ].join('\n'),
      domainWorkRules: '\n- MUST: Confirm commercial-use permission and license terms before using external assets',
    },
  },
}

// other・未知値の分野フォールバック（分野個性なし。reviewDescription は base の isCode 2-way 値を使う）
const EMPTY_DOMAIN_CONTENT: Record<'ja' | 'en', Omit<DomainContentVars, 'reviewDescription'>> = {
  ja: { skillTriggers: '等', verifyFocus: '', skillGotchas: '', domainWorkRules: '' },
  en: { skillTriggers: ', etc.', verifyFocus: '', skillGotchas: '', domainWorkRules: '' },
}

/**
 * code / non-code グループ + q1 分野に応じたセクション単位の変数を返す。
 * Free は isCodeFree(stack) と q1、Light は isCodeLight(answers) で判定した結果を渡す。
 * domain 省略時（Light 静的 rules = 普遍）は分野個性なしのフォールバック。
 */
export function buildDomainVars(isCode: boolean, lang: 'ja' | 'en', domain: string = 'other'): TemplateVars {
  const base = (isCode ? CODE : NON_CODE)[lang]
  const content = DOMAIN_CONTENT[domain]?.[lang]
  if (!content) {
    return { ...base, ...EMPTY_DOMAIN_CONTENT[lang] }
  }
  return { ...base, ...content }
}
