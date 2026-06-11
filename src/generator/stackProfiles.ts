import type { TemplateVars } from './render'

// Free 専用の Tech Stack マッピング。
// 質問 `stack`（言語）の回答から CLAUDE.md / README の Tech Stack を実値化する。
//
// 設計方針（2026-06-11「全行が効く」化で改訂）:
// - 回答から確実に実値化できるのは「言語名（Tech Stack）」のみ。
// - Build & Test / Architecture はコード由来の事実であり、コードが存在しない生成時点では
//   実値化できない。汎用文で埋めず、/init への引き継ぎ（domainProfiles の案内）に委譲する
//   （公式: /init は実コードからビルドコマンド・構成を検出し、既存 CLAUDE.md を上書きせず改善提案する）。
// - 記入指示（命令形「〜を書く」「実際の〜に置き換える」）は一切使わない完成文にする。

type StackVars = { techStack: string }

const STACK_PROFILES: Record<string, { ja: StackVars; en: StackVars }> = {
  ts: {
    ja: { techStack: '- 言語: TypeScript / JavaScript\n- 実行環境: Node.js' },
    en: { techStack: '- Language: TypeScript / JavaScript\n- Runtime: Node.js' },
  },
  python: {
    ja: { techStack: '- 言語: Python' },
    en: { techStack: '- Language: Python' },
  },
  go: {
    ja: { techStack: '- 言語: Go' },
    en: { techStack: '- Language: Go' },
  },
  rust: {
    ja: { techStack: '- 言語: Rust' },
    en: { techStack: '- Language: Rust' },
  },
  'other-code': {
    ja: { techStack: '- 言語: 複数またはその他のプログラミング言語' },
    en: { techStack: '- Language: Multiple or other programming languages' },
  },
  'non-code': {
    ja: { techStack: '- 主な作業: ドキュメント・コンテンツなどコード以外の成果物' },
    en: { techStack: '- Focus: Documentation, content, and other non-code deliverables' },
  },
}

const FALLBACK = 'other-code'

/**
 * stack 質問の回答（言語）から Tech Stack の実値を返す。
 * 未知の値・未回答は other-code にフォールバックし、破綻しない完成文を返す。
 * Free 経路（generate.ts）でのみ呼ばれる（Light/Plus は API 生成のため非到達）。
 */
export function buildStackVars(stackValue: string, lang: 'ja' | 'en'): TemplateVars {
  const profile = STACK_PROFILES[stackValue] ?? STACK_PROFILES[FALLBACK]
  return { techStack: profile[lang].techStack }
}
